import localFont from "next/font/local";

export const CMUSerif = localFont({
    src: [
        {
            path: "../public/cmu-serif.ttf",
            weight: "400",
            style: "normal",
        },
    ],
    display: "swap",
});

export const CMUTypewriter = localFont({
    src: [
        {
            path: "../public/cmu-typewriter.ttf",
            weight: "400",
            style: "normal",
        },
    ],
    display: "swap",
});
