/** Hours before the appointment inside which a cancellation is treated as late. */
export const LATE_CANCELLATION_WINDOW_HOURS = 12;

/** Percentage of the consultation fee charged for a late cancellation. */
export const LATE_CANCELLATION_FEE_RATE = 0.25;

export interface CancellationAssessment {
  /** Whether the patient is allowed to cancel at all. */
  canCancel: boolean;
  /** Reason cancellation is blocked, when it is. */
  blockedReason?: string;
  /** Whether the cancellation falls inside the late window. */
  isLate: boolean;
  /** Hours remaining until the appointment (can be negative). */
  hoursUntil: number;
  /** Estimated fee, when a consultation fee is known. */
  estimatedFee: number;
}

export function assessCancellation(
  booking: { status: string; booking_date: string; booking_time: string },
  consultationFee = 0,
): CancellationAssessment {
  const start = new Date(`${booking.booking_date}T${booking.booking_time}`);
  const hoursUntil = (start.getTime() - Date.now()) / 3_600_000;

  if (booking.status === "completed") {
    return {
      canCancel: false,
      blockedReason: "This visit is already completed. Report an issue instead if something went wrong.",
      isLate: false,
      hoursUntil,
      estimatedFee: 0,
    };
  }

  if (booking.status === "cancelled") {
    return { canCancel: false, blockedReason: "This booking is already cancelled.", isLate: false, hoursUntil, estimatedFee: 0 };
  }

  if (["on_the_way", "arrived"].includes(booking.status)) {
    return {
      canCancel: false,
      blockedReason:
        "Your professional is already on the way. Message them directly, or report an issue if you need to escalate.",
      isLate: true,
      hoursUntil,
      estimatedFee: 0,
    };
  }

  const isLate = hoursUntil < LATE_CANCELLATION_WINDOW_HOURS;

  return {
    canCancel: true,
    isLate,
    hoursUntil,
    estimatedFee: isLate ? Math.round(consultationFee * LATE_CANCELLATION_FEE_RATE * 100) / 100 : 0,
  };
}

export const CANCELLATION_POLICY_SUMMARY = `Cancel free of charge up to ${LATE_CANCELLATION_WINDOW_HOURS} hours before your appointment. Cancelling later carries a ${Math.round(
  LATE_CANCELLATION_FEE_RATE * 100,
)}% late-cancellation fee. Once your professional is on the way, the booking can no longer be cancelled — contact support or report an issue.`;
