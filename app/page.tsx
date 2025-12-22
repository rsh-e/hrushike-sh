import { Libertinus_Math } from "next/font/google";

const font = Libertinus_Math({ weight: "400" })

export default function Home() {
	return (
		<div className={`flex min-h-screen bg-white ${font.className}`}>
			<div className="flex min-h-screen w-full max-w-3xl ml-44 mt-44 text-black flex-col gap-y-3">
				<h3 className="text-5xl">hrushikesh emkay</h3>
				<p className="text-xl">
					hi, my name is hrushikesh, but most people call me rishi.
					i study computer science at the university of bristol.
					my interests lie in technology, business, history and politics.
					check out the links below:
				</p>
				<div className="flex flex-row space-x-5 text-blue-600">
					<a href="">[x]</a>
					{/* <a href="">[cv]</a> */}
					<a href="">[github]</a>
					<a href="">[linkedin]</a>
					<a href="">[medium]</a>
				</div>
			</div>
		</div>
	);
}
