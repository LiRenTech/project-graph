import type { Meta, StoryObj } from "@storybook/react";
import { Box } from "./Box";

const meta = {
  title: "Layout/Box",
  component: Box,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    children: {
      options: ["Text"],
      mapping: {
        Text: <>Box</>,
      },
    },
  },
} satisfies Meta<typeof Box>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Text: Story = {
  args: {
    children: <>Box</>,
  },
};
export const Tooltip: Story = {
  args: {
    children: <>Hover me</>,
    tooltip: "This is a tooltip",
  },
};
