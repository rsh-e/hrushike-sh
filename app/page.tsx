import { Libertinus_Math } from "next/font/google";
import { CMUSerif } from "./fonts";
import { CMUTypewriter } from "./fonts";

const serifFont = CMUSerif
const ttFont = CMUTypewriter


export default function Home() {
	return (
		<div className={`flex min-h-screen bg-white`}>
			<div className="flex min-h-screen w-full max-w-3xl m-36 text-black flex-col gap-y-3">
				<h3 className={`text-5xl ${serifFont.className}`}>Hrushikesh Emkay</h3>
				<div className={`${serifFont.className} text-xl space-y-5`}>
					<p className="my-3">
						Hi, my name is Hrushikesh, but most people call me Rishi. <br />
						I study Computer Science at the University of Bristol.
					</p>
					<div className="flex flex-col space-y-0.5">
						<div className="flex flex-row gap-x-5 font-semibold">
							<p>1</p>
							<p>Interests</p>
						</div>
						<ul className="ml-12 list-disc">
							<li>Concurrency and Distributed Programming</li>
							<li>Applications of Technology in Business</li>
							<li>Supply Chains, Operations and Strategy</li>
							<li>History</li>
							<li>Policy</li>

						</ul>
					</div>

					<div className="flex flex-col space-y-0.5">
						<div className="flex flex-row gap-x-5 font-semibold">
							<p>2</p>
							<p>Languages and Frameworks</p>
						</div>
						<ul className={`ml-12 list-disc ${ttFont.className}`}>
							<li>python -- fastapi, selenium</li>
							<li>js/ts -- next.js, react</li>
							<li>golang</li>
							<li>java</li>
						</ul>
					</div>

					<div className="flex flex-col space-y-0.5">
						<div className="flex flex-row gap-x-5 font-semibold">
							<p>3</p>
							<p>References</p>
						</div>
						<div className={`text-blue-600 space-x-5 ${ttFont.className}`}>
							<a href="">[x]</a>
							<a href="">[github]</a>
							<a href="">[linkedin]</a>
							<a href="">[medium]</a>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
