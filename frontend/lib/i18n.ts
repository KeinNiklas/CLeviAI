export type Language = "en" | "de";

export const translations = {
    en: {
        hero: {
            badge: "AI-Powered Learning",
            title_start: "Turn any document into a",
            title_gradient: "Learning Journey",
            subtitle: "Upload PDFs, research papers, or notes. CLeviAI instantly transforms them into interactive structured courses, quizzes, and summaries.",
            cta_start: "Start Learning",
            cta_demo: "View Demo",
        },
        features: {
            upload_title: "Instant Upload",
            upload_desc: "Drag & drop any PDF or doc. We process it securely in seconds.",
            ai_title: "AI Analysis",
            ai_desc: "Deep understanding of content to extract key concepts and facts.",
            course_title: "Structured Course",
            course_desc: "Get a complete curriculum with chapters, lessons, and quizzes.",
        },
        sidebar: {
            back: "Back",
            content: "Course Content",
            progress: "Progress",
        },
        dashboard: {
            continue: "Continue Learning",
            remaining: "remaining",
            streak: "Current Streak",
            completed: "Course Completed",
            score: "Average Quiz Score",
            up_next: "Up Next",
            start: "Start",
            days: "Days",
            modules: "Modules",

            // New additions
            your_plans: "Your Learning Profile",
            back_overview: "Back to Overview",
            no_plans: "No learning journeys found yet.",
            create_first: "Create your first plan",
            target: "Target",
            study_days: "Study Days",
            created_on: "Created",
            mastery: "Mastery",
            your_path: "Your Learning Path",
            goal: "Goal",
            study_routine: "Your Study Routine"
        },
        navbar: {
            new_journey: "New Journey",
            profile_dashboard: "Profile & Dashboard"
        },
        uploader: {
            drop_title: "Drop your study materials here",
            drop_desc: "Supports PDF, DOCX, TXT (Max 10 files)",
            error_max: "You can only upload up to 10 files at a time.",
            error_backend: "Failed to process files. Ensure backend is running.",
            error_fail: "Analysis failed. Please try again.",
            btn_analyzing: "Analyzing",
            btn_generate: "Generate Study Plan",
            table_title: "Selected Files",
            file: "file",
            files: "files"
        },
        plan: {
            title: "Create Your Study Routine",
            step1_title: "Step 1: Upload Materials",
            step1_desc: "Upload your script, notes, or book (PDF/DOCX).",
            step2_title: "Step 2: Configuration",
            step2_desc: "Customize your routine based on your schedule.",
            label_date: "Exam Date",
            label_parallel: "Parallel Courses (Workload)",
            note_parallel: "Higher values will spread specific topics over more days.",
            topics_title: "Detected Topics",
            btn_calculate: "Calculating Schedule...",
            btn_routine: "Generate Routine",
            btn_adjust: "Adjust Settings"
        },
        settings: {
            title: "Settings",
            language: "Language",
            language_desc: "Select your preferred language for the interface.",
            theme: "Theme",
            theme_desc: "Choose between light and dark mode.",
            save: "Save Changes"
        }
    },
    de: {
        hero: {
            badge: "KI-gestütztes Lernen",
            title_start: "Verwandle Dokumente in eine",
            title_gradient: "Lernreise",
            subtitle: "Lade PDFs, Forschungsarbeiten oder Notizen hoch. CLeviAI verwandelt sie sofort in interaktive Kurse, Quizze und Zusammenfassungen.",
            cta_start: "Jetzt Starten",
            cta_demo: "Demo Ansehen",
        },
        features: {
            upload_title: "Sofortiger Upload",
            upload_desc: "Drag & Drop für PDFs. Wir verarbeiten es sicher in Sekunden.",
            ai_title: "KI Analyse",
            ai_desc: "Tiefes Verständnis der Inhalte zum Extrahieren von Fakten.",
            course_title: "Strukturierter Kurs",
            course_desc: "Erhalte einen kompletten Lehrplan mit Kapiteln und Quizzen.",
        },
        sidebar: {
            back: "Zurück",
            content: "Kursinhalt",
            progress: "Fortschritt",
        },
        dashboard: {
            continue: "Weiterlernen",
            remaining: "verbleibend",
            streak: "Aktuelle Streak",
            completed: "Kurs abgeschlossen",
            score: "Durchschnittsnote",
            up_next: "Als nächstes",
            start: "Starten",
            days: "Tage",
            modules: "Module",

            // New additions
            your_plans: "Deine Lernpläne",
            back_overview: "Zurück zur Übersicht",
            no_plans: "Noch keine Lernpläne gefunden.",
            create_first: "Erstelle deinen ersten Plan",
            target: "Ziel",
            study_days: "Lerntage",
            created_on: "Erstellt am",
            mastery: "Fortschritt",
            your_path: "Dein Lernpfad",
            goal: "Ziel",
            study_routine: "Deine Lernroutine"
        },
        navbar: {
            new_journey: "Neuer Plan",
            profile_dashboard: "Profil & Dashboard"
        },
        uploader: {
            drop_title: "Dateien hier ablegen",
            drop_desc: "Unterstützt PDF, DOCX, TXT (Max 10 Dateien)",
            error_max: "Du kannst maximal 10 Dateien gleichzeitig hochladen.",
            error_backend: "Fehler beim Verarbeiten. Ist das Backend gestartet?",
            error_fail: "Analyse fehlgeschlagen. Bitte erneut versuchen.",
            btn_analyzing: "Analysiere",
            btn_generate: "Lernplan erstellen",
            table_title: "Ausgewählte Dateien",
            file: "Datei",
            files: "Dateien"
        },
        plan: {
            title: "Erstelle deinen Lernplan",
            step1_title: "Schritt 1: Materialien hochladen",
            step1_desc: "Lade dein Skript, Notizen oder Bücher hoch (PDF/DOCX).",
            step2_title: "Schritt 2: Konfiguration",
            step2_desc: "Passe deinen Plan an deinen Zeitplan an.",
            label_date: "Prüfungsdatum",
            label_parallel: "Parallele Kurse (Arbeitslast)",
            note_parallel: "Höhere Werte verteilen Themen auf mehr Tage.",
            topics_title: "Erkannte Themen",
            btn_calculate: "Berechne Plan...",
            btn_routine: "Routine generieren",
            btn_adjust: "Einstellungen anpassen"
        },
        settings: {
            title: "Einstellungen",
            language: "Sprache",
            language_desc: "Wähle deine bevorzugte Sprache für die Oberfläche.",
            theme: "Design",
            theme_desc: "Wähle zwischen Hell- und Dunkelmodus.",
            save: "Änderungen speichern"
        }
    },
};
