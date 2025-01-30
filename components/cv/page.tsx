import { CVData } from "../../app/api/extract-cv/route";

// export const metadata: Metadata = {
//   title: `${cvData.name} - Resume`,
//   description: cvData.about,
//   openGraph: {
//     title: `${cvData.name} - Resume`,
//     description: cvData.about,
//     type: "profile",
//     locale: "en_US",
//     images: [
//       {
//         url: "https://cv.jarocki.me/opengraph-image",
//         width: 1200,
//         height: 630,
//         alt: `${cvData.name}'s profile picture`,
//       },
//     ],
//   },
//   twitter: {
//     card: "summary_large_image",
//     title: `${cvData.name} - Resume`,
//     description: cvData.about,
//     images: ["https://cv.jarocki.me/opengraph-image"],
//   },
// };

/**
 * Transform social links for command menu
 */
function getCommandMenuLinks(cvData: CVData) {
  const links = [];

  if (cvData.personalWebsiteUrl) {
    links.push({
      url: cvData.personalWebsiteUrl,
      title: "Personal Website",
    });
  }

  return [
    ...links,
    ...cvData.contact.social.map((socialMediaLink) => ({
      url: socialMediaLink.url,
      title: socialMediaLink.name,
    })),
  ];
}

export default function ResumePage({ cvData }: { cvData: CVData }) {
  return (
    <main
      className="container relative mx-auto scroll-my-12 overflow-auto p-4 print:p-11 md:p-16"
      id="main-content"
    >
      <div className="sr-only">
        <h1>{cvData.name}&apos;s Resume</h1>
      </div>

      <section
        className="mx-auto w-full max-w-2xl space-y-8 bg-white print:space-y-4"
        aria-label="Resume Content"
      >
        <Header cvData={cvData} />

        <div className="space-y-8 print:space-y-4">
          <Summary summary={cvData.summary} />

          <WorkExperience work={cvData.work} />

          <Education education={cvData.education} />

          <Skills skills={cvData.skills} />

          <Projects projects={cvData.projects} />
        </div>
      </section>

      <nav className="print:hidden" aria-label="Quick navigation">
        <CommandMenu links={getCommandMenuLinks(cvData)} />
      </nav>
    </main>
  );
}
