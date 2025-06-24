import { useSummerPulse } from '../contexts/SummerPulseContext';

const ShhhLine: React.FC<ShhhLineProps> = ({ variant = 'ambient', context, emotion, timeOfDay, zone, userActivity, className }) => {
  const { isSummerPulseActive, getSummerNarratorLine } = useSummerPulse();

  if (isSummerPulseActive && (context === 'Summer Pulse' || variant === 'ambient')) {
    return <div className={`shhh-line summer-pulse ${className || ''}`}>{getSummerNarratorLine()}</div>;
  }

  return (
    <div className={`shhh-line ${variant} ${emotion} ${timeOfDay} ${zone} ${userActivity} ${className || ''}`}>
      {/* Placeholder for the rest of the component */}
    </div>
  );
};

export default ShhhLine; 