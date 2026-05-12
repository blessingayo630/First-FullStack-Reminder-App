'use client';

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="text-center">
        <div className="shake-clock mb-4 relative">
          <svg
            className="w-20 h-20 mx-auto text-gray-700"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Clock face */}
            <circle cx="12" cy="12" r="9" strokeWidth={1.5} fill="white" />

            {/* Clock hands */}
            <line x1="12" y1="12" x2="9.5" y2="7.5" strokeWidth={1.5} strokeLinecap="round" />
            <line x1="12" y1="12" x2="15.5" y2="8.5" strokeWidth={1} strokeLinecap="round" />

            {/* Second hand */}
            <line x1="12" y1="12" x2="13.5" y2="16" stroke="red" strokeWidth={0.8} strokeLinecap="round" />

            {/* Center dot */}
            <circle cx="12" cy="12" r="1.5" fill="currentColor" />

            {/* Bell/feet details */}
            <path d="M4 4 L6 6 M20 4 L18 6" strokeWidth={1} strokeLinecap="round" />
            <path d="M8 20 L10 19 M16 20 L14 19" strokeWidth={1} strokeLinecap="round" />
          </svg>

          {/* Animated rings/waves */}
          <div className="ring-wave"></div>
        </div>

        <p className="text-gray-600 text-lg font-medium">Loading reminders...</p>
        <p className="text-gray-400 text-sm mt-2">Please wait while we check your schedule</p>
      </div>

      <style jsx>{`
        .shake-clock {
          animation: shakeClock 0.6s cubic-bezier(0.36, 0.07, 0.19, 0.97) infinite;
          transform-origin: center;
          position: relative;
          display: inline-block;
        }

        .ring-wave {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 80px;
          height: 80px;
          border-radius: 50%;
          pointer-events: none;
        }

        .ring-wave::before,
        .ring-wave::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          border: 2px solid rgba(75, 85, 99, 0.3);
          animation: ring 1.5s ease-out infinite;
        }

        .ring-wave::after {
          animation-delay: 0.5s;
        }

        @keyframes shakeClock {
          0%,
          100% {
            transform: translateX(0) rotate(0deg);
          }
          10% {
            transform: translateX(-3px) rotate(-2deg);
          }
          20% {
            transform: translateX(3px) rotate(2deg);
          }
          30% {
            transform: translateX(-2px) rotate(-1deg);
          }
          40% {
            transform: translateX(2px) rotate(1deg);
          }
          50% {
            transform: translateX(0) rotate(0deg);
          }
          60% {
            transform: translateX(-1px) rotate(-0.5deg);
          }
          70% {
            transform: translateX(1px) rotate(0.5deg);
          }
        }

        @keyframes ring {
          0% {
            transform: scale(1);
            opacity: 0.6;
          }
          100% {
            transform: scale(1.8);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

