import { GithubInfo } from "fumadocs-ui/components/github-info";
import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";

/**
 * Shared layout configurations
 *
 * you can customise layouts individually from:
 * Home Layout: app/(home)/layout.tsx
 * Docs Layout: app/docs/layout.tsx
 */
export const baseOptions: BaseLayoutProps = {
  nav: {
    title: (
      <>
        <svg width="24" height="24y" viewBox="0 0 824 824" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="824" height="824" rx="185.4" fill="#243348" />
          <path
            d="M315 274.5C315 306.016 307.459 326.315 294.887 338.887C282.315 351.459 262.016 359 230.5 359C198.984 359 178.685 351.459 166.113 338.887C153.541 326.315 146 306.016 146 274.5C146 242.984 153.541 222.685 166.113 210.113C178.685 197.541 198.984 190 230.5 190C262.016 190 282.315 197.541 294.887 210.113C307.459 222.685 315 242.984 315 274.5Z"
            fill="#6AA645"
            fillOpacity="0.42"
            stroke="#7EB886"
            strokeWidth="30"
          />
          <path
            d="M315 550.5C315 582.016 307.459 602.315 294.887 614.887C282.315 627.459 262.016 635 230.5 635C198.984 635 178.685 627.459 166.113 614.887C153.541 602.315 146 582.016 146 550.5C146 518.984 153.541 498.685 166.113 486.113C178.685 473.541 198.984 466 230.5 466C262.016 466 282.315 473.541 294.887 486.113C307.459 498.685 315 518.984 315 550.5Z"
            fill="#387EB1"
            fillOpacity="0.7"
            stroke="#62B1FA"
            strokeWidth="30"
          />
          <path
            d="M678 550.5C678 582.016 670.459 602.315 657.887 614.887C645.315 627.459 625.016 635 593.5 635C561.984 635 541.685 627.459 529.113 614.887C516.541 602.315 509 582.016 509 550.5C509 518.984 516.541 498.685 529.113 486.113C541.685 473.541 561.984 466 593.5 466C625.016 466 645.315 473.541 657.887 486.113C670.459 498.685 678 518.984 678 550.5Z"
            fill="#6AA645"
            fillOpacity="0.42"
            stroke="#7EB886"
            strokeWidth="30"
          />
          <path
            d="M678 274.5C678 306.016 670.459 326.315 657.887 338.887C645.315 351.459 625.016 359 593.5 359C561.984 359 541.685 351.459 529.113 338.887C516.541 326.315 509 306.016 509 274.5C509 242.984 516.541 222.685 529.113 210.113C541.685 197.541 561.984 190 593.5 190C625.016 190 645.315 197.541 657.887 210.113C670.459 222.685 678 242.984 678 274.5Z"
            fill="#387EB1"
            fillOpacity="0.7"
            stroke="#62B1FA"
            strokeWidth="30"
          />
          <path
            d="M318 304C370.657 304 417.771 339.862 417.771 411.586C417.771 498.489 453.8 544 512 544"
            stroke="#7EB886"
            strokeWidth="30"
            strokeLinecap="round"
          />
          <path
            d="M400 498C385.862 533.176 360.414 544 318 544"
            stroke="#62B1FA"
            strokeWidth="30"
            strokeLinecap="round"
          />
          <path d="M429 339C434.68 322.846 471.6 304 500 304" stroke="#62B1FA" strokeWidth="30" strokeLinecap="round" />
        </svg>
        Project Graph
      </>
    ),
  },
  links: [
    {
      type: "custom",
      children: <GithubInfo owner="LiRenTech" repo="project-graph" className="lg:-mx-2" />,
    },
  ],
};
