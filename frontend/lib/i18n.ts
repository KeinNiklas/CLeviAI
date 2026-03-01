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
            profile_dashboard: "Your Journeys"
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
            btn_adjust: "Adjust Settings",

            // New fields
            label_name: "Journey Name",
            placeholder_name: "e.g. Finals Prep 2024",
            label_goal: "Daily Goal (Hours)",
            label_days: "Study Days",
            go_dashboard: "Go to Dashboard"
        },
        settings: {
            title: "Settings",
            general: "General",
            language: "Language",
            language_desc: "Select your preferred language for the interface.",
            theme: "Theme",
            theme_desc: "Choose between light and dark mode.",
            save: "Save Changes",
            saving: "Saving...",
            ai_config: "AI Configuration",
            pref_model: "Preferred Model",
            gemini: "Google Gemini",
            gemini_desc: "Detailed analysis & reasoning",
            groq: "Groq (Llama 3)",
            groq_desc: "Ultra-fast inference speed",
            groq_key: "Groq API Key (Llama 3)",
            gemini_key: "Gemini API Key",
            light: "Light",
            dark: "Dark",
            system: "System"
        },
        auth: {
            welcome: "Welcome Back",
            subtitle_login: "Sign in to continue your learning journey",
            create_account: "Create Account",
            subtitle_register: "Join CLeviAI and start learning smarter",
            email: "Email address",
            password: "Password",
            confirm_password: "Confirm Password",
            full_name: "Full Name (Optional)",
            sign_in: "Sign In",
            sign_up: "Sign Up",
            no_account: "Don't have an account?",
            has_account: "Already have an account?",
            register_here: "Create one now",
            signin_here: "Sign in instead",
            passwords_mismatch: "Passwords don't match",
            login_failed: "Login failed",
            registration_failed: "Registration failed",
            email_placeholder: "you@example.com",
            name_placeholder: "John Doe"
        },
        user_menu: {
            settings: "Settings",
            manage_subscription: "Manage Subscription"
        },
        subscription: {
            title: "Upgrade to Pro",
            description: "Unlock your full learning potential",
            price: "9.99€",
            month: "/ month",
            subscribe_btn: "Subscribe Now",
            processing: "Processing...",
            success_title: "Payment Successful!",
            success_msg: "Welcome to Pro! Redirecting you to dashboard...",

            // Features
            feat_unlimited: "Unlimited Study Plans",
            feat_analytics: "Advanced Analytics & Insights",
            feat_ai: "AI-Powered Recommendations",
            feat_support: "Priority Support",

            // Manage
            manage_title: "Current Plan: Pro",
            manage_desc: "You have full access",
            status_label: "Status",
            status_active: "Active",
            next_billing: "Next Billing",
            amount_label: "Amount",
            cancel_btn: "Cancel Subscription",
            confirm_cancel: "Are you sure you want to cancel your Pro subscription? You will lose access to premium features.",
            cancel_success: "Subscription cancelled. You are now on the Standard plan.",
            cancel_fail: "Failed to cancel subscription."
        },
        limits: {
            warning_title: "Plan Limit Reached",
            warning_desc: "You have reached the maximum of {limit} active study plans for the Standard tier.",
            upgrade_prompt: "Please {link} to create unlimited plans.",
            upgrade_link: "upgrade to Pro",
            btn_upgrade: "Upgrade to Pro"
        },
        admin: {
            title: "Administration",
            nav_general: "General",
            nav_users: "Users",

            // Users Page
            users_title: "User Management",
            users_search: "Search users...",
            users_all: "All Users",
            table_name: "Name",
            table_email: "Email",
            table_role: "Role",
            table_tier: "Tier",
            table_status: "Status",
            table_actions: "Actions",
            role_admin: "Admin",
            role_user: "User",
            tier_pro: "PRO",
            tier_standard: "Standard",
            status_active: "Active",
            status_disabled: "Disabled",

            // Actions
            promote_admin: "Promote to Admin",
            demote_user: "Demote to User",
            upgrade_pro: "Upgrade to PRO",
            downgrade_standard: "Downgrade to Standard",
            disable_account: "Disable Account",
            enable_account: "Enable Account",
            delete_user: "Delete User",
            confirm_delete: "Are you sure you want to delete user",
            confirm_delete_suffix: "? This will allow DELETE all their study plans as well.",

            // General Page
            general_title: "General Settings",
            config_success: "Settings saved successfully",
            config_fail: "Failed to save settings",
            config_error: "Error saving settings"
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
            profile_dashboard: "Deine Lernpläne"
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
            btn_adjust: "Einstellungen anpassen",

            // New fields
            label_name: "Name der Reise",
            placeholder_name: "z.B. Abi Vorbereitung 2024",
            label_goal: "Tagesziel (Stunden)",
            label_days: "Lerntage",
            go_dashboard: "Zum Dashboard"
        },
        settings: {
            title: "Einstellungen",
            general: "Allgemein",
            language: "Sprache",
            language_desc: "Wähle deine bevorzugte Sprache für die Oberfläche.",
            theme: "Design",
            theme_desc: "Wähle zwischen Hell- und Dunkelmodus.",
            save: "Speichern",
            saving: "Speichern...",
            ai_config: "KI Konfiguration",
            pref_model: "Bevorzugtes Modell",
            gemini: "Google Gemini",
            gemini_desc: "Detaillierte Analyse & Reasoning",
            groq: "Groq (Llama 3)",
            groq_desc: "Ultra-schnelle Inferenz",
            groq_key: "Groq API Key (Llama 3)",
            gemini_key: "Gemini API Key",
            light: "Hell",
            dark: "Dunkel",
            system: "System"
        },
        auth: {
            welcome: "Willkommen zurück",
            subtitle_login: "Melde dich an, um weiterzulernen",
            create_account: "Konto erstellen",
            subtitle_register: "Werde Teil von CLeviAI und lerne smarter",
            email: "E-Mail-Adresse",
            password: "Passwort",
            confirm_password: "Passwort bestätigen",
            full_name: "Vollständiger Name (Optional)",
            sign_in: "Anmelden",
            sign_up: "Registrieren",
            no_account: "Noch kein Konto?",
            has_account: "Bereits ein Konto?",
            register_here: "Jetzt erstellen",
            signin_here: "Hier anmelden",
            passwords_mismatch: "Passwörter stimmen nicht überein",
            login_failed: "Anmeldung fehlgeschlagen",
            registration_failed: "Registrierung fehlgeschlagen",
            email_placeholder: "du@beispiel.de",
            name_placeholder: "Max Mustermann"
        },
        user_menu: {
            settings: "Einstellungen",
            manage_subscription: "Abo verwalten"
        },
        subscription: {
            title: "Upgrade auf Pro",
            description: "Entfessele dein volles Lernpotenzial",
            price: "9,99€",
            month: "/ Monat",
            subscribe_btn: "Jetzt abonnieren",
            processing: "Verarbeite...",
            success_title: "Zahlung erfolgreich!",
            success_msg: "Willkommen bei Pro! Weiterleitung zum Dashboard...",

            // Features
            feat_unlimited: "Unbegrenzte Lernpläne",
            feat_analytics: "Erweiterte Analysen & Insights",
            feat_ai: "KI-gestützte Empfehlungen",
            feat_support: "Bevorzugter Support",

            // Manage
            manage_title: "Aktueller Plan: Pro",
            manage_desc: "Du hast vollen Zugriff",
            status_label: "Status",
            status_active: "Aktiv",
            next_billing: "Nächste Rechnung",
            amount_label: "Betrag",
            cancel_btn: "Abo kündigen",
            confirm_cancel: "Bist du sicher, dass du dein Pro-Abo kündigen möchtest? Du verlierst den Zugriff auf Premium-Funktionen.",
            cancel_success: "Abo gekündigt. Du bist jetzt im Standard-Tarif.",
            cancel_fail: "Kündigung fehlgeschlagen."
        },
        limits: {
            warning_title: "Plan-Limit erreicht",
            warning_desc: "Du hast das Maximum von {limit} aktiven Lernplänen für den Standard-Tarif erreicht.",
            upgrade_prompt: "Bitte {link}, um unbegrenzt Pläne zu erstellen.",
            upgrade_link: "auf Pro upgraden",
            btn_upgrade: "Upgrade auf Pro"
        },
        admin: {
            title: "Verwaltung",
            nav_general: "Allgemein",
            nav_users: "Benutzer",

            // Users Page
            users_title: "Benutzerverwaltung",
            users_search: "Benutzer suchen...",
            users_all: "Alle Benutzer",
            table_name: "Name",
            table_email: "E-Mail",
            table_role: "Rolle",
            table_tier: "Level",
            table_status: "Status",
            table_actions: "Aktionen",
            role_admin: "Admin",
            role_user: "Nutzer",
            tier_pro: "PRO",
            tier_standard: "Standard",
            status_active: "Aktiv",
            status_disabled: "Deaktiviert",

            // Actions
            promote_admin: "Zum Admin befördern",
            demote_user: "Zum Nutzer herabstufen",
            upgrade_pro: "Auf PRO upgraden",
            downgrade_standard: "Auf Standard herabstufen",
            disable_account: "Konto deaktivieren",
            enable_account: "Konto aktivieren",
            delete_user: "Benutzer löschen",
            confirm_delete: "Möchtest du den Benutzer",
            confirm_delete_suffix: "wirklich löschen? Dies löscht auch alle Lernpläne.",

            // General Page
            general_title: "Allgemeine Einstellungen",
            config_success: "Einstellungen erfolgreich gespeichert",
            config_fail: "Fehler beim Speichern",
            config_error: "Fehler aufgetreten"
        }
    },
};
