"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertTriangle,
  Download,
  Edit,
  Loader2,
  Monitor,
  Save,
} from "lucide-react";
import { toast } from "sonner";
import MDEditor from "@uiw/react-md-editor";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { saveResume } from "@/actions/resume";
import { EntryForm } from "./entry-form";
import useFetch from "@/hooks/use-fetch";
import { useUser } from "@clerk/nextjs";
import { entriesToMarkdown } from "@/app/lib/helper";
import { resumeSchema } from "@/app/lib/schema";

export default function ResumeBuilder({ initialContent }) {
  const [activeTab, setActiveTab] = useState("edit");
  const [previewContent, setPreviewContent] = useState(initialContent);
  const [resumeMode, setResumeMode] = useState("preview");
  const [isGenerating, setIsGenerating] = useState(false);

  const { user } = useUser();

  const {
    control,
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resumeSchema),
    defaultValues: {
      contactInfo: {},
      summary: "",
      skills: "",
      experience: [],
      education: [],
      projects: [],
    },
  });

  const {
    loading: isSaving,
    fn: saveResumeFn,
    data: saveResult,
    error: saveError,
  } = useFetch(saveResume);

  const formValues = watch();

  useEffect(() => {
    if (initialContent) setActiveTab("preview");
  }, [initialContent]);

  useEffect(() => {
    if (activeTab === "edit") {
      const content = getCombinedContent();
      setPreviewContent(content || initialContent);
    }
  }, [formValues, activeTab]);

  useEffect(() => {
    if (saveResult && !isSaving) toast.success("Resume saved successfully!");
    if (saveError) toast.error(saveError.message || "Save failed");
  }, [saveResult, saveError, isSaving]);

  const getContactMarkdown = () => {
    const { contactInfo } = formValues;
    const parts = [];
    if (contactInfo.email) parts.push(`📧 ${contactInfo.email}`);
    if (contactInfo.mobile) parts.push(`📱 ${contactInfo.mobile}`);
    if (contactInfo.linkedin)
      parts.push(`💼 [LinkedIn](${contactInfo.linkedin})`);
    if (contactInfo.twitter)
      parts.push(`🐦 [Twitter](${contactInfo.twitter})`);

    return parts.length
      ? `## <div align="center">${user?.fullName ?? ""}</div>

<div align="center">
${parts.join(" | ")}
</div>`
      : "";
  };

  const getCombinedContent = () => {
    const { summary, skills, experience, education, projects } = formValues;
    return [
      getContactMarkdown(),
      summary && `## Professional Summary\n\n${summary}`,
      skills && `## Skills\n\n${skills}`,
      entriesToMarkdown(experience, "Work Experience"),
      entriesToMarkdown(education, "Education"),
      entriesToMarkdown(projects, "Projects"),
    ]
      .filter(Boolean)
      .join("\n\n");
  };

  const generatePDF = async () => {
    setIsGenerating(true);
    try {
      const root = document.getElementById("resume-pdf");
      if (!root) {
        toast.error("Resume content not found");
        return;
      }

      const { default: html2pdf } = await import("html2pdf.js");

      await html2pdf()
        .from(root)
        .set({
          filename: "resume.pdf",
          html2canvas: {
            scale: 2,
            useCORS: true,
            allowTaint: true,
          },
          jsPDF: {
            unit: "mm",
            format: "a4",
            orientation: "portrait",
          },
        })
        .save();
    } catch (err) {
      console.error(err);
      toast.error("PDF generation failed");
    } finally {
      setIsGenerating(false);
    }
  };

  const onSubmit = async () => {
    await saveResumeFn(previewContent);
  };

  return (
    <div data-color-mode="light" className="space-y-4">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-2">
        <h1 className="font-bold text-5xl md:text-6xl bg-gradient-to-b from-gray-400 via-gray-200 to-gray-600 text-transparent bg-clip-text">
          Resume Builder
        </h1>
        <div className="space-x-2">
          <Button
            variant="destructive"
            onClick={handleSubmit(onSubmit)}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" /> Save
              </>
            )}
          </Button>

          <Button onClick={generatePDF} disabled={isGenerating}>
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" /> Download PDF
              </>
            )}
          </Button>
        </div>
      </div>

      {/* TABS */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="edit">Form</TabsTrigger>
          <TabsTrigger value="preview">Markdown</TabsTrigger>
        </TabsList>

        {/* FORM TAB */}
        <TabsContent value="edit">
          <form className="space-y-8">
            {/* CONTACT */}
            <div className="grid md:grid-cols-2 gap-4 p-4 border rounded-lg bg-muted/50">
              <Input {...register("contactInfo.email")} placeholder="Email" />
              <Input {...register("contactInfo.mobile")} placeholder="Mobile" />
              <Input
                {...register("contactInfo.linkedin")}
                placeholder="LinkedIn"
              />
              <Input {...register("contactInfo.twitter")} placeholder="Twitter" />
            </div>

            <Controller
              name="summary"
              control={control}
              render={({ field }) => (
                <Textarea {...field} placeholder="Professional summary" />
              )}
            />

            <Controller
              name="skills"
              control={control}
              render={({ field }) => (
                <Textarea {...field} placeholder="Skills" />
              )}
            />

            <Controller
              name="experience"
              control={control}
              render={({ field }) => (
                <EntryForm
                  type="Experience"
                  entries={field.value}
                  onChange={field.onChange}
                />
              )}
            />

            <Controller
              name="education"
              control={control}
              render={({ field }) => (
                <EntryForm
                  type="Education"
                  entries={field.value}
                  onChange={field.onChange}
                />
              )}
            />

            <Controller
              name="projects"
              control={control}
              render={({ field }) => (
                <EntryForm
                  type="Project"
                  entries={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </form>
        </TabsContent>

        {/* PREVIEW TAB */}
        <TabsContent value="preview">
          <Button
            variant="link"
            onClick={() =>
              setResumeMode(resumeMode === "preview" ? "edit" : "preview")
            }
          >
            {resumeMode === "preview" ? (
              <>
                <Edit className="mr-2 h-4 w-4" /> Edit Markdown
              </>
            ) : (
              <>
                <Monitor className="mr-2 h-4 w-4" /> Show Preview
              </>
            )}
          </Button>

          <MDEditor
            value={previewContent}
            onChange={setPreviewContent}
            height={800}
            preview={resumeMode}
          />
        </TabsContent>
      </Tabs>

      {/* ✅ OFF-SCREEN PDF RENDER TARGET (DO NOT HIDE) */}
      <div
        style={{
          position: "fixed",
          left: "-99999px",
          top: 0,
          width: "794px",
          background: "white",
        }}
      >
        <div id="resume-pdf">
          <MDEditor.Markdown
            source={previewContent}
            style={{ background: "white", color: "black" }}
          />
        </div>
      </div>
    </div>
  );
}
