import { CMS_NAME } from "@/lib/constants";

export function Intro() {
  return (
    <section className="flex-col md:flex-row flex items-center md:justify-between mt-3 mb-16 md:mb-12">
      <div>
        <h1 className="text-5xl md:text-8xl font-bold tracking-tighter leading-tight md:pr-8">
          Books
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 mt-2">
          Notes from Books I've read
        </p>
      </div>
    </section>
  );
}
