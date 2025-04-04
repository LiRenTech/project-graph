import React from "react";

interface Props {
  data: Record<string, any>;
}

const Frame: React.FC<Props> = ({ data }) => {
  // const [el, setEl] = useState<HTMLIFrameElement | null>(null);

  return (
    <iframe
      src={`https://web.project-graph.top/?frame=true&file=${btoa(
        Array.from(new TextEncoder().encode(JSON.stringify(data)), (byte) => String.fromCharCode(byte)).join(""),
      )}`}
      width="100%"
      height="400px"
      // ref={setEl}
      // onMouseEnter={() => el?.focus()}
    />
  );
};

export default Frame;
