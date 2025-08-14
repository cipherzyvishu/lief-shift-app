import { NextRequest, NextResponse } from 'next/server';
import { auth0 } from '@/lib/auth0';
import { prisma } from '@/lib/prisma';
import { isWithinGeofence, formatDistance } from '@/utils/geofence';

export async function POST(request: NextRequest) {
  try {
    // Get the authenticated user's session
    const session = await auth0.getSession();
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Find the user in our database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found in database' },
        { status: 404 }
      );
    }

    // Check if user already has an active shift
    const existingActiveShift = await prisma.shift.findFirst({
      where: {
        userId: user.id,
        status: 'CLOCKED_IN'
      }
    });

    if (existingActiveShift) {
      return NextResponse.json(
        { error: 'User already has an active shift' },
        { status: 400 }
      );
    }

    // Get request body for notes and location
    const body = await request.json();
    const { notes, latitude, longitude, locationId } = body;

    // Validate required GPS coordinates for geofencing
    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      return NextResponse.json(
        { error: 'GPS coordinates are required for clock-in' },
        { status: 400 }
      );
    }

    // Find or use the default location if no specific location provided
    let location;
    if (locationId) {
      location = await prisma.location.findUnique({
        where: { id: locationId }
      });
    } else {
      // Use the first available location as default
      location = await prisma.location.findFirst();
    }

    if (!location) {
      return NextResponse.json(
        { error: 'No location available for clock-in' },
        { status: 400 }
      );
    }

    // TASK 4.3: Implement geofence enforcement
    const geofenceCheck = isWithinGeofence(
      latitude,
      longitude,
      location.latitude,
      location.longitude,
      location.radius
    );

    if (!geofenceCheck.isWithin) {
      const formattedDistance = formatDistance(geofenceCheck.distance);
      return NextResponse.json(
        { 
          error: 'GEOFENCE_VIOLATION',
          message: `You are too far from the location to clock in. You are ${formattedDistance} away, but must be within ${formatDistance(location.radius)} of ${location.name}.`,
          details: {
            distance: geofenceCheck.distance,
            maxDistance: location.radius,
            locationName: location.name
          }
        },
        { status: 403 }
      );
    }

    // Create the shift (only if within geofence)
    const shift = await prisma.shift.create({
      data: {
        userId: user.id,
        locationId: location.id,
        clockInTime: new Date(),
        clockInLat: latitude,
        clockInLng: longitude,
        clockInNote: notes || null,
        status: 'CLOCKED_IN'
      },
      include: {
        location: true,
        user: true
      }
    });

    console.log(`✅ User ${user.email} clocked in at ${location.name} (within ${formatDistance(geofenceCheck.distance)} of geofence)`);

    return NextResponse.json({
      success: true,
      message: `Successfully clocked in at ${location.name}`,
      shift: {
        id: shift.id,
        clockInTime: shift.clockInTime,
        location: {
          name: shift.location.name,
          latitude: shift.location.latitude,
          longitude: shift.location.longitude
        },
        notes: shift.clockInNote,
        distance: geofenceCheck.distance
      }
    });

  } catch (error) {
    console.error('❌ Clock-in error:', error);
    return NextResponse.json(
      { error: 'Internal server error during clock-in' },
      { status: 500 }
    );
  }
}
