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

    // Find the active shift
    const activeShift = await prisma.shift.findFirst({
      where: {
        userId: user.id,
        status: 'CLOCKED_IN'
      },
      include: {
        location: true
      }
    });

    if (!activeShift) {
      return NextResponse.json(
        { error: 'No active shift found to clock out' },
        { status: 400 }
      );
    }

    // Get request body for notes and location
    const body = await request.json();
    const { notes, latitude, longitude } = body;

    // Calculate total hours
    const clockOutTime = new Date();
    const clockInTime = new Date(activeShift.clockInTime);
    const totalHours = (clockOutTime.getTime() - clockInTime.getTime()) / (1000 * 60 * 60);

    // Update the shift to clock out
    const updatedShift = await prisma.shift.update({
      where: { id: activeShift.id },
      data: {
        clockOutTime,
        clockOutLat: latitude || activeShift.location.latitude,
        clockOutLng: longitude || activeShift.location.longitude,
        clockOutNote: notes || null,
        status: 'CLOCKED_OUT',
        totalHours: Math.round(totalHours * 100) / 100 // Round to 2 decimal places
      },
      include: {
        location: true,
        user: true
      }
    });

    console.log(`✅ User ${user.email} clocked out after ${totalHours.toFixed(2)} hours`);

    return NextResponse.json({
      success: true,
      message: 'Successfully clocked out',
      shift: {
        id: updatedShift.id,
        clockInTime: updatedShift.clockInTime,
        clockOutTime: updatedShift.clockOutTime,
        totalHours: updatedShift.totalHours,
        location: {
          name: updatedShift.location.name,
          latitude: updatedShift.location.latitude,
          longitude: updatedShift.location.longitude
        },
        clockInNote: updatedShift.clockInNote,
        clockOutNote: updatedShift.clockOutNote
      }
    });

  } catch (error) {
    console.error('❌ Clock-out error:', error);
    return NextResponse.json(
      { error: 'Internal server error during clock-out' },
      { status: 500 }
    );
  }
}
