import { CMS_NAME } from "@/lib/constants";

export function Post(title: string, desc: string, date: string, author: string, content: string) {
  return (
    <section className="flex-col md:flex-row flex items-center md:justify-between mt-16 mb-16 md:mb-12">
      <div>
        <h1 className="text-5xl md:text-8xl font-bold tracking-tighter leading-tight md:pr-8">
          {title}
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 mt-2">
          {desc}
        </p>
      </div>

      <h4 className="text-center md:text-left text-lg mt-5 md:pl-8">
      </h4>
    </section>
  );
}
