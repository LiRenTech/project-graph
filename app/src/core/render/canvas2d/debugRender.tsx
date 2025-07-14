import { Vector } from "../../dataStruct/Vector";
import { SvgRenderer } from "./basicRenderer/svgRenderer";
import { Renderer } from "./renderer";

/**
 * 调试渲染用
 */
export function debugRender() {
  //
  const svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="6.089ex" height="4.588ex" viewBox="0 -1342 2691.4 2028" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" style=""><defs><path id="MJX-8-TEX-I-1D44E" d="M33 157Q33 258 109 349T280 441Q331 441 370 392Q386 422 416 422Q429 422 439 414T449 394Q449 381 412 234T374 68Q374 43 381 35T402 26Q411 27 422 35Q443 55 463 131Q469 151 473 152Q475 153 483 153H487Q506 153 506 144Q506 138 501 117T481 63T449 13Q436 0 417 -8Q409 -10 393 -10Q359 -10 336 5T306 36L300 51Q299 52 296 50Q294 48 292 46Q233 -10 172 -10Q117 -10 75 30T33 157ZM351 328Q351 334 346 350T323 385T277 405Q242 405 210 374T160 293Q131 214 119 129Q119 126 119 118T118 106Q118 61 136 44T179 26Q217 26 254 59T298 110Q300 114 325 217T351 328Z"></path><path id="MJX-8-TEX-N-2B" d="M56 237T56 250T70 270H369V420L370 570Q380 583 389 583Q402 583 409 568V270H707Q722 262 722 250T707 230H409V-68Q401 -82 391 -82H389H387Q375 -82 369 -68V230H70Q56 237 56 250Z"></path><path id="MJX-8-TEX-N-35" d="M164 157Q164 133 148 117T109 101H102Q148 22 224 22Q294 22 326 82Q345 115 345 210Q345 313 318 349Q292 382 260 382H254Q176 382 136 314Q132 307 129 306T114 304Q97 304 95 310Q93 314 93 485V614Q93 664 98 664Q100 666 102 666Q103 666 123 658T178 642T253 634Q324 634 389 662Q397 666 402 666Q410 666 410 648V635Q328 538 205 538Q174 538 149 544L139 546V374Q158 388 169 396T205 412T256 420Q337 420 393 355T449 201Q449 109 385 44T229 -22Q148 -22 99 32T50 154Q50 178 61 192T84 210T107 214Q132 214 148 197T164 157Z"></path><path id="MJX-8-TEX-N-34" d="M462 0Q444 3 333 3Q217 3 199 0H190V46H221Q241 46 248 46T265 48T279 53T286 61Q287 63 287 115V165H28V211L179 442Q332 674 334 675Q336 677 355 677H373L379 671V211H471V165H379V114Q379 73 379 66T385 54Q393 47 442 46H471V0H462ZM293 211V545L74 212L183 211H293Z"></path></defs><g stroke="currentColor" fill="currentColor" stroke-width="0" transform="matrix(1 0 0 -1 0 0)"><g data-mml-node="math"><g data-mml-node="mfrac"><g data-mml-node="mrow" transform="translate(220, 676)"><g data-mml-node="mi"><use xlink:href="#MJX-8-TEX-I-1D44E"></use></g><g data-mml-node="mo" transform="translate(751.2, 0)"><use xlink:href="#MJX-8-TEX-N-2B"></use></g><g data-mml-node="mn" transform="translate(1751.4, 0)"><use xlink:href="#MJX-8-TEX-N-35"></use></g></g><g data-mml-node="mn" transform="translate(1095.7, -686)"><use xlink:href="#MJX-8-TEX-N-34"></use></g><rect width="2451.4" height="60" x="120" y="220"></rect></g></g></g></svg>`;

  SvgRenderer.renderSvgFromLeftTopWithoutSize(
    svgString,
    Renderer.transformWorld2View(new Vector(100, 100)),
    // 100 * Camera.currentScale,
    // 200 * Camera.currentScale,
  );
}
