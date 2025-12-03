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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { saveResume } from "@/actions/resume";
import { EntryForm } from "./entry-form";
import useFetch from "@/hooks/use-fetch";
import { useUser } from "@clerk/nextjs";
import { entriesToMarkdown } from "@/app/lib/helper";
import { resumeSchema } from "@/app/lib/schema";
// import html2pdf from "html2pdf.js";


export default function ResumeBuilder({ initialContent }) {
    const [activeTab, setActiveTab] = useState("edit");
    const [previewContent, setPreviewContent] = useState(initialContent);
    const { user } = useUser();
    const [resumeMode, setResumeMode] = useState("preview");

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

    // Watch form fields for preview updates
    const formValues = watch();

    useEffect(() => {
        if (initialContent) setActiveTab("preview");
    }, [initialContent]);

    // Update preview content when form values change
    useEffect(() => {
        if (activeTab === "edit") {
            const newContent = getCombinedContent();
            setPreviewContent(newContent ? newContent : initialContent);
        }
    }, [formValues, activeTab]);

    // Handle save result
    useEffect(() => {
        if (saveResult && !isSaving) {
            toast.success("Resume saved successfully!");
        }
        if (saveError) {
            toast.error(saveError.message || "Failed to save resume");
        }
    }, [saveResult, saveError, isSaving]);

    const getContactMarkdown = () => {
        const { contactInfo } = formValues;
        const parts = [];
        if (contactInfo.email) parts.push(`📧 ${contactInfo.email}`);
        if (contactInfo.mobile) parts.push(`📱 ${contactInfo.mobile}`);
        if (contactInfo.linkedin)
            parts.push(`💼 [LinkedIn](${contactInfo.linkedin})`);
        if (contactInfo.twitter) parts.push(`🐦 [Twitter](${contactInfo.twitter})`);

        return parts.length > 0
            ? `## <div align="center">${user.fullName}</div>
        \n\n<div align="center">\n\n${parts.join(" | ")}\n\n</div>`
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

    const [isGenerating, setIsGenerating] = useState(false);


    const generatePDF = async () => {
        setIsGenerating(true);
        try {
            const root = document.getElementById("resume-pdf");
            if (!root) {
                toast.error("Resume content not found.");
                return;
            }

            // dynamic import
            const { default: html2pdf } = await import("html2pdf.js");

            // clone DOM
            const clone = root.cloneNode(true);

            // give each element a unique data attribute so we can target it from a stylesheet
            let idCounter = 0;
            const origEls = Array.from(root.querySelectorAll("*"));
            const cloneEls = Array.from(clone.querySelectorAll("*"));

            // include root in arrays
            origEls.unshift(root);
            cloneEls.unshift(clone);

            // assign data attributes on cloned elements and prepare mapping
            const mappings = [];
            for (let i = 0; i < origEls.length; i++) {
                const orig = origEls[i];
                const cl = cloneEls[i];
                const pdfId = `pdf-${++idCounter}`;
                cl.setAttribute("data-pdf-id", pdfId);
                mappings.push({ pdfId, orig, cl });
            }

            // Helper to resolve computed property (including pseudo elements)
            const resolveProp = (el, prop, pseudo = null) => {
                try {
                    // set on a temporary element if needed — but getComputedStyle usually returns resolved rgb/hex
                    const val = window.getComputedStyle(el, pseudo).getPropertyValue(prop);
                    if (!val) return "";
                    // if value still contains lab() or color-mix(), try to let browser resolve via tmp
                    if (val.includes("lab(") || val.includes("color-mix(") || /lch|oklch|oklab/.test(val)) {
                        const tmp = document.createElement("div");
                        tmp.style.position = "fixed";
                        tmp.style.left = "-99999px";
                        tmp.style.top = "0";
                        tmp.style[prop] = val;
                        document.body.appendChild(tmp);
                        const resolved = window.getComputedStyle(tmp).getPropertyValue(prop);
                        tmp.remove();
                        return resolved || val;
                    }
                    return val;
                } catch {
                    return "";
                }
            };

            // properties we will inline (add more if you see issues)
            const props = [
                "color",
                "background-color",
                "background",
                "border-color",
                "border-top-color",
                "border-right-color",
                "border-bottom-color",
                "border-left-color",
                "box-shadow",
                "text-shadow",
                "fill",
                "stroke",
                "font-size",
                "font-weight",
                "font-family",
                "line-height",
                "padding",
                "margin",
                "text-align",
                "white-space"
            ];

            // build stylesheet text that targets each clone element by [data-pdf-id="..."]
            let styleText = "/* inlined computed styles for pdf export */\n";
            for (const { pdfId, orig } of mappings) {
                let rules = "";
                for (const p of props) {
                    const v = resolveProp(orig, p, null);
                    if (v) {
                        // basic safety: if still contains lab, skip property
                        if (typeof v === "string" && v.includes("lab(")) continue;
                        rules += `${p}: ${v} !important; `;
                    }
                }

                // pseudo-elements ::before and ::after (these often carry decorative colors)
                const beforeColor = resolveProp(orig, "content", "::before"); // content rarely needed
                // collect resolved styles for pseudo elements for color/background/shadow
                const pseudoProps = ["color", "background-color", "box-shadow", "text-shadow", "background"];
                let beforeRules = "";
                let afterRules = "";
                for (const pp of pseudoProps) {
                    const bv = resolveProp(orig, pp, "::before");
                    if (bv && !bv.includes("lab(")) beforeRules += `${pp}: ${bv} !important; `;
                    const av = resolveProp(orig, pp, "::after");
                    if (av && !av.includes("lab(")) afterRules += `${pp}: ${av} !important; `;
                }

                if (rules) {
                    styleText += `[data-pdf-id="${pdfId}"] { ${rules} }\n`;
                }
                if (beforeRules) {
                    styleText += `[data-pdf-id="${pdfId}"]::before { ${beforeRules} }\n`;
                }
                if (afterRules) {
                    styleText += `[data-pdf-id="${pdfId}"]::after { ${afterRules} }\n`;
                }
            }

            // global fallback: force text color black and background white inside wrapper if anything still problematic
            styleText += `#__pdf_wrapper * { color: black !important; background: transparent !important; }\n`;
            styleText += `#__pdf_wrapper { background: white !important; }\n`;

            // create wrapper and inject style + clone
            const wrapper = document.createElement("div");
            wrapper.id = "__pdf_wrapper";
            Object.assign(wrapper.style, {
                position: "fixed",
                left: "-99999px",
                top: "0",
                zIndex: 999999,
                background: "white",
                color: "black"
            });

            const styleEl = document.createElement("style");
            styleEl.type = "text/css";
            styleEl.appendChild(document.createTextNode(styleText));
            wrapper.appendChild(styleEl);
            wrapper.appendChild(clone);
            document.body.appendChild(wrapper);

            // run html2pdf on the wrapper (visible to html2canvas)
            await html2pdf()
                .from(wrapper)
                .set({
                    filename: "resume.pdf",
                    html2canvas: { scale: 2, useCORS: true },
                    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
                })
                .save();

            // cleanup
            wrapper.remove();
        } catch (err) {
            console.error("PDF ERROR:", err);
            toast.error("PDF generation failed: " + (err?.message ?? ""));
        } finally {
            setIsGenerating(false);
        }
    };


    const onSubmit = async (data) => {
        try {
            const formattedContent = previewContent
                .replace(/\n/g, "\n") // Normalize newlines
                .replace(/\n\s*\n/g, "\n\n") // Normalize multiple newlines to double newlines
                .trim();

            console.log(previewContent, formattedContent);
            await saveResumeFn(previewContent);
        } catch (error) {
            console.error("Save error:", error);
        }
    };

    return (
        <div data-color-mode="light" className="space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-2">
                <h1 className="font-bold bg-gradient-to-b from-gray-400 via-gray-200 to-gray-600 tracking-tighter text-transparent bg-clip-text pb-2 text-5xl md:text-6xl">
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
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="h-4 w-4" />
                                Save
                            </>
                        )}
                    </Button>
                    <Button onClick={generatePDF} disabled={isGenerating}>
                        {isGenerating ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Generating PDF...
                            </>
                        ) : (
                            <>
                                <Download className="h-4 w-4" />
                                Download PDF
                            </>
                        )}
                    </Button>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                    <TabsTrigger value="edit">Form</TabsTrigger>
                    <TabsTrigger value="preview">Markdown</TabsTrigger>
                </TabsList>

                <TabsContent value="edit">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                        {/* Contact Information */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">Contact Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg bg-muted/50">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Email</label>
                                    <Input
                                        {...register("contactInfo.email")}
                                        type="email"
                                        placeholder="your@email.com"
                                        error={errors.contactInfo?.email}
                                    />
                                    {errors.contactInfo?.email && (
                                        <p className="text-sm text-red-500">
                                            {errors.contactInfo.email.message}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Mobile Number</label>
                                    <Input
                                        {...register("contactInfo.mobile")}
                                        type="tel"
                                        placeholder="+1 234 567 8900"
                                    />
                                    {errors.contactInfo?.mobile && (
                                        <p className="text-sm text-red-500">
                                            {errors.contactInfo.mobile.message}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">LinkedIn URL</label>
                                    <Input
                                        {...register("contactInfo.linkedin")}
                                        type="url"
                                        placeholder="https://linkedin.com/in/your-profile"
                                    />
                                    {errors.contactInfo?.linkedin && (
                                        <p className="text-sm text-red-500">
                                            {errors.contactInfo.linkedin.message}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">
                                        Twitter/X Profile
                                    </label>
                                    <Input
                                        {...register("contactInfo.twitter")}
                                        type="url"
                                        placeholder="https://twitter.com/your-handle"
                                    />
                                    {errors.contactInfo?.twitter && (
                                        <p className="text-sm text-red-500">
                                            {errors.contactInfo.twitter.message}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Summary */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">Professional Summary</h3>
                            <Controller
                                name="summary"
                                control={control}
                                render={({ field }) => (
                                    <Textarea
                                        {...field}
                                        className="h-32"
                                        placeholder="Write a compelling professional summary..."
                                        error={errors.summary}
                                    />
                                )}
                            />
                            {errors.summary && (
                                <p className="text-sm text-red-500">{errors.summary.message}</p>
                            )}
                        </div>

                        {/* Skills */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">Skills</h3>
                            <Controller
                                name="skills"
                                control={control}
                                render={({ field }) => (
                                    <Textarea
                                        {...field}
                                        className="h-32"
                                        placeholder="List your key skills..."
                                        error={errors.skills}
                                    />
                                )}
                            />
                            {errors.skills && (
                                <p className="text-sm text-red-500">{errors.skills.message}</p>
                            )}
                        </div>

                        {/* Experience */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">Work Experience</h3>
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
                            {errors.experience && (
                                <p className="text-sm text-red-500">
                                    {errors.experience.message}
                                </p>
                            )}
                        </div>

                        {/* Education */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">Education</h3>
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
                            {errors.education && (
                                <p className="text-sm text-red-500">
                                    {errors.education.message}
                                </p>
                            )}
                        </div>

                        {/* Projects */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">Projects</h3>
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
                            {errors.projects && (
                                <p className="text-sm text-red-500">
                                    {errors.projects.message}
                                </p>
                            )}
                        </div>
                    </form>
                </TabsContent>

                <TabsContent value="preview">
                    {activeTab === "preview" && (
                        <Button
                            variant="link"
                            type="button"
                            className="mb-2"
                            onClick={() =>
                                setResumeMode(resumeMode === "preview" ? "edit" : "preview")
                            }
                        >
                            {resumeMode === "preview" ? (
                                <>
                                    <Edit className="h-4 w-4" />
                                    Edit Resume
                                </>
                            ) : (
                                <>
                                    <Monitor className="h-4 w-4" />
                                    Show Preview
                                </>
                            )}
                        </Button>
                    )}

                    {activeTab === "preview" && resumeMode !== "preview" && (
                        <div className="flex p-3 gap-2 items-center border-2 border-yellow-600 text-yellow-600 rounded mb-2">
                            <AlertTriangle className="h-5 w-5" />
                            <span className="text-sm">
                                You will lose editied markdown if you update the form data.
                            </span>
                        </div>
                    )}
                    <div className="border rounded-lg">
                        <MDEditor
                            value={previewContent}
                            onChange={setPreviewContent}
                            height={800}
                            preview={resumeMode}
                        />
                    </div>
                    <div className="hidden">
                        <div id="resume-pdf">
                            <MDEditor.Markdown
                                source={previewContent}
                                style={{
                                    background: "white",
                                    color: "black",
                                }}
                            />
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}