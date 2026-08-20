import Svg, { Path } from 'react-native-svg';

type FleetLogoProps = {
  size?: number;
};

/** FleetSync truck mark supplied in Group 2.svg. */
export function FleetLogo({ size = 52 }: FleetLogoProps) {
  return (
    <Svg width={size} height={size} viewBox="25.5 14 98 98" fill="none">
      <Path d="M25.5 38C25.5 24.745 36.245 14 49.5 14h50c13.255 0 24 10.745 24 24v50c0 13.255-10.745 24-24 24h-50c-13.255 0-24-10.745-24-24V38Z" fill="#0E2033" />
      <Path d="M74.5 39.55a23.45 23.45 0 1 1-23.45 23.45" stroke="#F5A21E" strokeWidth={5.025} strokeLinecap="round" opacity={0.92} />
      <Path d="m66.46 40.555 8.04-1.005 1.675 8.04" stroke="#F5A21E" strokeWidth={5.025} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M53.73 74.39V63c0-1.117.558-1.675 1.675-1.675H75.84V74.39H53.73ZM77.85 74.39v-8.04h4.02l3.685-6.365c.447-.67 1.117-1.005 2.01-1.005h5.025c1.117 0 1.675.558 1.675 1.675V74.39H77.85Z" fill="#F5A21E" />
      <Path fillRule="evenodd" clipRule="evenodd" d="M61.1 79.884a4.154 4.154 0 1 0 0-8.308 4.154 4.154 0 0 0 0 8.308Zm0-2.345a1.809 1.809 0 1 0 0-3.618 1.809 1.809 0 0 0 0 3.618ZM71.82 79.884a4.154 4.154 0 1 0 0-8.308 4.154 4.154 0 0 0 0 8.308Zm0-2.345a1.809 1.809 0 1 0 0-3.618 1.809 1.809 0 0 0 0 3.618ZM87.9 79.884a4.154 4.154 0 1 0 0-8.308 4.154 4.154 0 0 0 0 8.308Zm0-2.345a1.809 1.809 0 1 0 0-3.618 1.809 1.809 0 0 0 0 3.618Z" fill="#F5A21E" />
    </Svg>
  );
}
