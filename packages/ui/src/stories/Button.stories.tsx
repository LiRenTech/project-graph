import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { Code } from "lucide-react";
import { Button } from "./Button";

const meta = {
  title: "Input/Button",
  component: Button,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    children: {
      options: ["Text", "Icon & Text"],
      mapping: {
        Text: <>Button</>,
        "Icon & Text": (
          <>
            <Code />
            Button
          </>
        ),
      },
    },
  },
  args: { onClick: fn() },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Text: Story = {
  args: {
    children: <>Button</>,
  },
};
export const Disabled: Story = {
  args: {
    children: <>Button</>,
    disabled: true,
  },
};
export const WithIcon: Story = {
  args: {
    children: (
      <>
        <Code />
        Button
      </>
    ),
  },
};
