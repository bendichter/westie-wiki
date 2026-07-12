import { OgCard, ogResponse, OG_SIZE } from "@/lib/og";

export const alt = "Westie Wiki — West Coast Swing moves, documented by dancers";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function OpenGraphImage() {
  return ogResponse(
    <OgCard
      eyebrow="The community move wiki"
      title="West Coast Swing, documented by the people dancing it."
      subtitle="Moves · timestamped video · dances · learning paths"
    />
  );
}
