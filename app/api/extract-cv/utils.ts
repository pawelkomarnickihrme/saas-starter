import { createClient } from "../../../utils/supabase /server";
import { CVData } from "./route";

// Function to save CV data
export async function saveCVData(data: CVData) {
  const supabase = await createClient();

  // Insert into resume table
  const { data: resumeData, error: resumeError } = await supabase
    .from("resume")
    .insert([
      {
        name: data.name,
        initials: data.initials,
        location: data.location,
        about: data.about,
        contact: data.contact,
      },
    ])
    .single();

  if (resumeError) {
    console.error("Error inserting resume:", resumeError);
    return;
  }

  const resumeId = resumeData.id;

  // Insert into education table
  const educationPromises = data.education.map(async (edu) => {
    const { error: eduError } = await supabase.from("education").insert([
      {
        school: edu.school,
        degree: edu.degree,
        start: edu.start,
        end_year: edu.end,
        resume_id: resumeId,
      },
    ]);

    if (eduError) {
      console.error("Error inserting education:", eduError);
    }
  });

  await Promise.all(educationPromises);

  // Insert into work_experience table
  const workPromises = data.work.map(async (work) => {
    const { error: workError } = await supabase.from("work_experience").insert([
      {
        company: work.company,
        link: work.link,
        badges: work.badges,
        title: work.title,
        start: work.start,
        end_year: work.end,
        resume_id: resumeId,
      },
    ]);

    if (workError) {
      console.error("Error inserting work experience:", workError);
    }
  });

  await Promise.all(workPromises);

  // Insert into projects table
  const projectPromises = data.projects.map(async (project) => {
    const { error: projectError } = await supabase.from("projects").insert([
      {
        title: project.title,
        tech_stack: project.techStack,
        description: project.description,
        link: project.link,
        resume_id: resumeId,
      },
    ]);

    if (projectError) {
      console.error("Error inserting project:", projectError);
    }
  });

  await Promise.all(projectPromises);

  console.log("CV data saved successfully!");
}

// Call the function with the CV data
