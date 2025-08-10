import { NextRequest, NextResponse } from 'next/server';
import { auth0 } from '@/lib/auth0';
import { prisma } from '@/lib/prisma';

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

    // Create the shift
    const shift = await prisma.shift.create({
      data: {
        userId: user.id,
        locationId: location.id,
        clockInTime: new Date(),
        clockInLat: latitude || location.latitude,
        clockInLng: longitude || location.longitude,
        clockInNote: notes || null,
        status: 'CLOCKED_IN'
      },
      include: {
        location: true,
        user: true
      }
    });

    console.log(`✅ User ${user.email} clocked in at ${location.name}`);

    return NextResponse.json({
      success: true,
      message: 'Successfully clocked in',
      shift: {
        id: shift.id,
        clockInTime: shift.clockInTime,
        location: {
          name: shift.location.name,
          latitude: shift.location.latitude,
          longitude: shift.location.longitude
        },
        notes: shift.clockInNote
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
