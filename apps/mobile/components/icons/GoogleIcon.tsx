import Svg, { Path } from "react-native-svg";

type GoogleIconProps = {
  size?: number;
};

export default function GoogleIcon({ size = 24 }: GoogleIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M21.805 12.23c0-.79-.07-1.55-.2-2.28H12v4.32h5.49a4.7 4.7 0 0 1-2.04 3.08v2.56h3.3c1.93-1.78 3.055-4.4 3.055-7.68z"
        fill="#4285F4"
      />
      <Path
        d="M12 22c2.76 0 5.08-.92 6.77-2.49l-3.3-2.56c-.92.62-2.09.99-3.47.99-2.67 0-4.93-1.8-5.74-4.22H2.85v2.64A10 10 0 0 0 12 22z"
        fill="#34A853"
      />
      <Path
        d="M6.26 13.72A6 6 0 0 1 5.94 12c0-.6.11-1.18.31-1.72V7.64H2.85A10 10 0 0 0 2 12c0 1.61.38 3.14 1.05 4.36l3.21-2.64z"
        fill="#FBBC05"
      />
      <Path
        d="M12 6.04c1.5 0 2.84.51 3.9 1.52l2.92-2.92C17.08 2.98 14.76 2 12 2a10 10 0 0 0-9.15 5.64l3.4 2.64c.81-2.42 3.07-4.24 5.75-4.24z"
        fill="#EA4335"
      />
    </Svg>
  );
}
