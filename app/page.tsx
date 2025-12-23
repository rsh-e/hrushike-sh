import { Libertinus_Math } from "next/font/google";
import { CMUSerif } from "./fonts";
import { CMUTypewriter } from "./fonts";

const serifFont = CMUSerif
const ttFont = CMUTypewriter


export default function Home() {
	return (
		<div className={`flex min-h-screen bg-[#FCF8F3]`}>
			<div className="flex min-h-screen w-full max-w-3xl m-10 mt-16 md:m-36 text-black flex-col gap-y-3">
				<h3 className={`text-5xl ${serifFont.className}`}>Hrushikesh Emkay</h3>
				<div className={`${serifFont.className} text-xl space-y-5`}>
					<p className="my-3">
						Hi, my name is Hrushikesh, but most people call me Rishi. <br />
						I study Computer Science at the University of Bristol.
					</p>
					<div className="flex flex-col space-y-0.5">
						<div className="flex flex-row gap-x-5 font-bold">
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
						<div className="flex flex-row gap-x-5 font-bold">
							<p>2</p>
							<p>Languages and Frameworks</p>
						</div>
						<ul className={`ml-8 list-none`}>
							<li className="flex items-center">
								<span className={`w-56 ${ttFont.className}`}>{`{Python, Go}`}</span>
								<span className="w-6 text-center mx-3">→</span>
								<span>Backend Systems</span>
							</li>
							<li className="flex items-center">
								<span className={`w-56 ${ttFont.className}`}>{`{Next.js, Typescript}`}</span>
								<span className="w-6 text-center mx-3">→</span>
								<span>Frontend</span>
							</li>
							<li className="flex items-center">
								<span className={`w-56 ${ttFont.className}`}>{`{Java, C}`}</span>
								<span className="w-6 text-center mx-3">→</span>
								<span>General Purpose</span>
							</li>
						</ul>
					</div>

					<div className="flex flex-col space-y-0.5">
						<div className="flex flex-row gap-x-5 font-semibold">
							<p>3</p>
							<p>References</p>
						</div>
						<div className={`text-blue-600 space-x-5 ${ttFont.className}`}>
							<a className="hover:text-purple-900" target="_blank" href="https://x.com/rsh_emk">[x]</a>
							<a className="hover:text-purple-900" target="_blank" href="https://github.com/rsh-e">[github]</a>
							<a className="hover:text-purple-900" target="_blank" href="https://linkedin.com/in/rsh-e">[linkedin]</a>
							<a className="hover:text-purple-900" target="_blank" href="https://rsh-emk.medium.com">[medium]</a>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
