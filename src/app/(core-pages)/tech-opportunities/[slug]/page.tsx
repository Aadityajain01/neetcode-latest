import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { techDetails } from "../../../../../data/techDetails";
import TechHistoryAreaChart from "@/components/tech-opportunities/TechHistoryAreaChart";

type TechDetailsPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateStaticParams() {
  return Object.keys(techDetails).map((slug) => ({ slug }));
}

export default async function TechDetailsPage({ params }: TechDetailsPageProps) {
  const { slug } = await params;
  const tech = techDetails[slug];

  if (!tech) {
    notFound();
  }

  const overviewRows = [
    ["Role", tech.title],
    ["Salary Range", tech.salary],
    ["Demand", tech.demand],
    ["Responsibilities", `${tech.responsibilities.length} tracked items`],
    ["Standout Signals", `${tech.standout.length} strengths`],
    ["Core Skills", `${tech.skills.core.length} focus areas`],
    ["Tools", `${tech.skills.tools.length} recommended tools`],
    ["Suitability", `${tech.suitability.length} fit indicators`],
  ];

  return (
    <div className="h-full overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      <div className="font-sans pb-20 max-w-7xl mx-auto pt-6 px-4 sm:px-6 lg:px-8 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col gap-4 pb-6 border-b border-white/5">
          <Link
            href="/tech-opportunities"
            className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-zinc-400 hover:text-brand-400 transition-colors"
          >
            <ArrowLeft size={16} />
            Back to opportunities
          </Link>

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter">
                {tech.title}
              </h1>
              <p className="text-zinc-400 font-medium mt-2 max-w-4xl leading-relaxed">{tech.description}</p>
            </div>

            <div className="text-sm uppercase tracking-[0.24em] text-zinc-500 space-y-2">
              <div>Salary: <span className="text-white font-semibold tracking-normal normal-case">{tech.salary}</span></div>
              <div>Demand: <span className="text-emerald-400 font-semibold tracking-normal normal-case">{tech.demand}</span></div>
            </div>
          </div>
        </div>

        <section className="grid grid-cols-1 xl:grid-cols-[1fr_1.15fr] gap-10 border-y border-zinc-800/60 py-8">
          <div>
            <h2 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.25em] mb-4">Role Snapshot</h2>
            <table className="w-full text-sm border border-zinc-800/60">
              <tbody>
                {overviewRows.map(([label, value]) => (
                  <tr key={label} className="border-t border-zinc-800/60 first:border-t-0">
                    <th className="w-52 px-4 py-3 text-left uppercase tracking-[0.2em] text-[10px] text-zinc-500 font-bold bg-zinc-950/60">
                      {label}
                    </th>
                    <td className="px-4 py-3 text-zinc-200">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <TechHistoryAreaChart history={tech.history} />
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-2 gap-10 border-b border-zinc-800/60 pb-8">
          <div>
            <h2 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.25em] mb-4">Responsibilities List</h2>
            <ol className="space-y-3 text-sm text-zinc-200 list-decimal pl-5 marker:text-brand-400">
              {tech.responsibilities.map((item) => (
                <li key={item} className="leading-relaxed pl-1">{item}</li>
              ))}
            </ol>
          </div>

          <div>
            <h2 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.25em] mb-4">Standout Indicators</h2>
            <ul className="space-y-3 text-sm text-zinc-200">
              {tech.standout.map((item) => (
                <li key={item} className="flex gap-3 leading-relaxed">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="space-y-8 border-b border-zinc-800/60 pb-8">
          <div>
            <h2 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.25em] mb-4">Skills Matrix</h2>
            <table className="w-full text-sm border border-zinc-800/60">
              <thead className="bg-zinc-950/60 text-zinc-500 uppercase tracking-[0.22em] text-[10px]">
                <tr>
                  <th className="px-4 py-3 text-left font-bold w-40">Group</th>
                  <th className="px-4 py-3 text-left font-bold">Items</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-zinc-800/60">
                  <td className="px-4 py-4 text-brand-400 font-semibold align-top">Core Skills</td>
                  <td className="px-4 py-4 text-zinc-200">
                    <ul className="space-y-2">
                      {tech.skills.core.map((skill) => (
                        <li key={skill}>{skill}</li>
                      ))}
                    </ul>
                  </td>
                </tr>
                <tr className="border-t border-zinc-800/60">
                  <td className="px-4 py-4 text-purple-400 font-semibold align-top">Tools</td>
                  <td className="px-4 py-4 text-zinc-200">
                    <ul className="space-y-2">
                      {tech.skills.tools.map((tool) => (
                        <li key={tool}>{tool}</li>
                      ))}
                    </ul>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.25em] mb-4">Best Suited For</h2>
          <ul className="space-y-3 text-sm text-zinc-200">
            {tech.suitability.map((item) => (
              <li key={item} className="flex gap-3 leading-relaxed">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-500" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
