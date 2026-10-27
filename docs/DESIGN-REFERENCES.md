# Design references: premium glass TV launcher (65" LG OLED, 1920x1080 render, 10 ft, D-pad + pointer)

Compiled 2026-10-27. Every number carries a URL. Items marked **[unverified]** came from secondary sources or could not be confirmed against a primary page.

---

## 1. Apple tvOS 26 / Liquid Glass / tvOS HIG

### 1.1 Liquid Glass material (what Apple actually specifies)

Apple publishes no blur radius, tint alpha or shadow values. It specifies the material by *behaviour*. The citable facts:

- Composition. "Liquid Glass is composed of a number of layers that work together to give it its unique look" and "each layer continuously adapts based on what's behind it." The defining optical trait is **lensing**: "The primary way Liquid Glass visually defines itself is through something called Lensing." Highlights come from environment light sources and respond to geometry; the shadow layer "increases the opacity of its shadow when it is over text." — WWDC25 219 "Meet Liquid Glass" transcript: https://nonstrict.eu/wwdcindex/wwdc2025/219/ (official video: https://developer.apple.com/videos/play/wwdc2025/219/)
- Size-dependent depth. "When glass flexes and morphs to larger sizes" it "casts deeper, richer shadows, has more pronounced lensing and refraction effects, and a softer scattering of light." Same source.
- Motion. "it has an inherent gel-like flexibility"; "Liquid Glass responds to interaction by instantly flexing and energizing with light"; "Elements can even lift up into Liquid Glass temporarily, such as when you interact with a component." Same source.
- Two variants. **Regular** "blurs and adjusts the luminosity of background content to maintain legibility"; **Clear** "is highly translucent" and is for "components that float above media backgrounds — such as photos and videos." — HIG Materials: https://developer.apple.com/design/human-interface-guidelines/materials
- The one hard number: for Clear glass over bright content "consider adding a dark dimming layer of **35% opacity**." (HIG Materials, same URL.) SwiftUI's `Glass.clear` doc sample uses `.background(.black.opacity(0.3))`: https://developer.apple.com/documentation/swiftui/glass/clear
- Rules. "always avoid glass on glass"; "Stacking Liquid Glass elements on top of each other can quickly make the interface feel cluttered"; "Don't use Liquid Glass in the content layer"; "Use Liquid Glass effects sparingly." (219 transcript + HIG Materials.)
- Colour. "By default, Liquid Glass has no inherent color, and instead takes on colors from the content directly behind it." Tint only primary actions; "Refrain from adding color to the background of multiple controls." Small elements flip light/dark against content; "Liquid Glass appears more opaque in larger elements like sidebars." — HIG Color: https://developer.apple.com/design/human-interface-guidelines/color
- Corner geometry. Three shape classes: fixed radius, capsule ("half the height of the container"), concentric ("calculate their radius by subtracting padding from the parent's"). — WWDC25 356 "Get to know the new design system": https://nonstrict.eu/wwdcindex/wwdc2025/356/ (video: https://developer.apple.com/videos/play/wwdc2025/356/). Same concentric formula in the visionOS session: "inner corner radius + padding = outer corner radius" (https://wwdcnotes.com/documentation/wwdc23-10076-design-for-spatial-user-interfaces/).
- Scroll edge effect. "Soft is the default"; hard "creates a stronger, more opaque boundary." Don't mix the two. (356 transcript.) HIG Layout: "Instead of applying a solid or semi-opaque background color beneath controls, use a scroll edge effect." https://developer.apple.com/design/human-interface-guidelines/layout
- Apple's own tvOS 26 wording: Liquid Glass "reflects and refracts its surroundings using real-time rendering"; "designed to keep the focus on what's playing"; available on Apple TV 4K 2nd gen and later only. https://www.apple.com/newsroom/2025/06/apple-tv-brings-a-beautiful-redesign-and-enhanced-home-entertainment-experience/
- On tvOS specifically: "Liquid Glass appears throughout navigation elements and system experiences such as Top Shelf and Control Center. Certain interface elements, like image views and buttons, adopt Liquid Glass when they gain focus." (HIG Materials.) tvOS also keeps standard materials: ultraThin (full-screen light), thin (overlay, light), regular (overlay), thick (overlay, dark).
- Motion of the material by input: Liquid Glass "responds to direct touch interaction with greater emphasis … but produces a more subdued effect when a person interacts using a trackpad." — HIG Motion: https://developer.apple.com/design/human-interface-guidelines/motion (relevant: pointer-remote vs D-pad should get different emphasis).
- App icons on tvOS 27 betas gained "Liquid Glass refraction effects that change as you move your finger over the remote's touch surface" (Photos, Podcasts). Third-party tvOS icons have no Icon Composer path. https://developer.apple.com/forums/thread/842107

### 1.2 Focus behaviour (tvOS)

- Definition. "As an element comes into focus, the system elevates it to the foreground, gently swaying it while applying illumination that makes the element's surface appear to shine. After a period of inactivity, out-of-focus content dims and the focused element expands." — HIG Images > tvOS: https://developer.apple.com/design/human-interface-guidelines/images
- Five states: unfocused (translucent, small shadow), focused ("larger … elevation to the foreground, illumination, and animation", opaque white bg, black text), highlighted (press: "briefly invert its colors and animate"), selected, unavailable (no shadow, low contrast). — HIG Focus and selection: https://developer.apple.com/design/human-interface-guidelines/focus-and-selection
- "Avoid using only color to indicate focus. Subtle scaling and responsive animation are the primary ways to denote interactivity." (HIG Color, tvOS.)
- "Avoid displaying a pointer. People expect to navigate a fixed number of items by changing focus." If a pointer is required, "make sure it's highly visible and feels integrated." (HIG Focus and selection, tvOS.) Direct tension with the LG Magic Remote; see §6.
- "Avoid changing focus without people's interaction." Exception: when the focused item disappears under discrete directional input, move to an adjacent item. (Same page.)
- Timing. Apple publishes no fixed duration. `UIFocusAnimationContext.duration` exposes "the duration (measured in seconds) of the focus animation" so custom animations can be, e.g., "exactly half the duration of the system animations." https://developer.apple.com/documentation/uikit/uifocusanimationcontext — Apple's coordinator docs state focusing animations run faster than unfocusing ones to create a "trail" and that you should "never assume a fixed duration" **[wording from search summary of the UIFocusAnimationCoordinator page; verify at https://developer.apple.com/documentation/uikit/uifocusanimationcoordinator]**.
- Scale factor. Apple publishes none. Derivable from HIG Top Shelf tables (unfocused → focused/safe-zone size): poster 333→380 pt wide = **1.14x**; square 500→570 = **1.14x**; 16:9 782→852 = **1.09x**; banner 1740x560→1740x620 (height only, 1.107x). https://developer.apple.com/design/human-interface-guidelines/top-shelf — Community samples use 1.158 (Apple forum, https://developer.apple.com/forums/thread/48813) and 1.1 **[unverified, non-Apple]**.
- Padding. "When you use UIKit and the focus APIs, an element gets bigger when it comes into focus … make sure you don't let them overlap important information." (HIG Layout, tvOS.)

### 1.3 Layered images / parallax

- "A layered image consists of two to five distinct layers … layers closer to the surface elevate and scale, overlapping lower layers farther back and producing a 3D effect." App icon **must** be layered; Top Shelf images "strongly encouraged, but optional." Background layer must be opaque ("you'll get an error if it's not"). Keep text in the foreground layer. "Parallax is designed to be almost unnoticeable." — https://developer.apple.com/design/human-interface-guidelines/images
- Runtime format `.lcr` generated by `layerutil` from `.lsr`/PSD; Parallax Previewer: https://help.apple.com/itc/parallaxpreviewer/
- Icon safe zone: "the system crops foreground layers more than background layers"; safe zone "can vary, depending on the image size, layer depth, and motion." — HIG App icons: https://developer.apple.com/design/human-interface-guidelines/app-icons

### 1.4 Safe zones, grids (1920x1080 = 1920x1080 pt @1x)

- "Inset primary content **60 points from the top and bottom** of the screen, and **80 points from the sides**." https://developer.apple.com/design/human-interface-guidelines/layout
- Grid tables (unfocused width / horizontal spacing / min vertical spacing), all with **40 pt** h-spacing and **100 pt** min v-spacing: 2-col 860 pt; 3-col 560; 4-col 410; 5-col 320; 6-col 260; 7-col 217; 8-col 184; 9-col 160. "Make partially hidden content look symmetrical." Same URL.
- "Include additional vertical spacing for titled rows." Same URL.

### 1.5 Typography (SF Pro on tvOS)

- Default **29 pt**, minimum **23 pt** (tvOS row of the platform table). https://developer.apple.com/design/human-interface-guidelines/typography
- tvOS built-in text styles (weight / size / leading / emphasized weight): Title 1 Medium 76/96 Bold; Title 2 Medium 57/66 Bold; Title 3 Medium 48/56 Bold; Headline Medium 38/46 Bold; Subtitle 1 Regular 38/46 Medium; Callout Medium 31/38 Bold; Body Medium 29/36 Bold; Caption 1 Medium 25/32 Bold; Caption 2 Medium 23/30 Bold. Same URL (section "tvOS built-in text styles"; a "tvOS tracking values" table follows it).
- SF optical sizes: SF Text below 20 pt, SF Display at 20 pt and up (WWDC20 10175 "The details of UI typography": https://developer.apple.com/videos/play/wwdc2020/10175/). Everything on a 10-ft UI is therefore a Display cut.
- These are 1080p point values; at 4K tvOS renders @2x so pixel sizes double (HIG Images: macOS/tvOS scale factors "@1x and @2x").

### 1.6 Colour / contrast

- tvOS: "Consider choosing a limited color palette that coordinates with your app logo"; "Test tvOS apps on multiple brands of HD and 4K TVs, and with different display settings." Provide light + dark variants "to support Liquid Glass adaptivity." https://developer.apple.com/design/human-interface-guidelines/color
- System colours (dark defaults, RGB): Blue 0,145,255; Indigo 109,124,255; Teal 0,210,224; Green 48,209,88; Red 255,66,69; Orange 255,146,48; Yellow 255,214,0; Purple 219,52,242; Pink 255,55,95. Same URL (Specifications table).
- Apple gives no numeric contrast ratio on the colour page; use WCAG 4.5:1 body / 3:1 large text as the floor (https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html).
- Non-Apple but sound for OLED rooms: avoid pure #FFFFFF, "reserve high-contrast colors for focus states" (Smashing, §6).

### 1.7 Top Shelf dimensions (pt @1x; @2x doubles)

- Static fallback: **2320x720** (4640x1440 @2x); system "flips and blurs the image" to fit 1920 wide at 16:9.
- Sectioned row, poster 2:3: actual 404x608, focused/safe 380x570, unfocused 333x570. Square: 608x608 / 570x570 / 500x500. 16:9: 908x512 / 852x479 / 782x440. Mixed rows scale up to the tallest (16:9 → 500 px tall next to posters).
- Scrolling inset banner: actual 1940x692, focused/safe 1740x620, unfocused 1740x560; provide 3–8 images; auto-scrolls on a timer until focused.
- Carousel templates ship with two buttons by default (Play + More Info).
- https://developer.apple.com/design/human-interface-guidelines/top-shelf

### 1.8 App icon

- tvOS layout **800x480 px**, rectangle (landscape), "Layered (Parallax)", 2–5 layers, system applies rounded concentric corners; provide unmasked rectangular layers. Legacy sizes 400x240 / 1280x768 are older asset-catalog slots **[400x240 and 1280x768 from third-party docs: https://docs.easeltv.com/docs/apple-tv-submission]**. The 5:3 aspect holds for all three. https://developer.apple.com/design/human-interface-guidelines/app-icons
- "The system dynamically applies visual effects to your app icon layers, so there's no need to include specular highlights, drop shadows between layers, beveled edges, blurs, glows." Same URL.

### 1.9 Remote / input model (Siri Remote)

- Swipe "starts fast and then slows down, based on the strength of the swipe"; edge swipes "speed through items very quickly." Press before swipe enters scrubbing. Back opens the parent (not necessarily previous screen); press-and-hold Back goes Home. "always moving focus in the same direction as the gesture." Taps can be inadvertent; avoid acting on taps during playback. https://developer.apple.com/design/human-interface-guidelines/remotes
- Ergonomics: viewers are "often 8 feet or more" away. https://developer.apple.com/design/human-interface-guidelines/designing-for-tvos

---

## 2. Apple TV / tvOS 26 reference images

- Apple Newsroom hero (Liquid Glass on Apple TV): https://www.apple.com/newsroom/images/2025/06/apple-tv-brings-a-beautiful-redesign-and-enhanced-home-entertainment-experience/article/Apple-WWDC25-tvOS-26-hero-250609_big.jpg.large.jpg — article: https://www.apple.com/newsroom/2025/06/apple-tv-brings-a-beautiful-redesign-and-enhanced-home-entertainment-experience/ (Aerial screensaver stills 01–08 follow the pattern `.../Apple-WWDC25-tvOS-26-Aerial-screen-saver-0N-250609_big.jpg.large.jpg`).
- PCWorld hands-on (Jared Newman, July 2025) — the clearest real home-screen capture: https://www.pcworld.com/wp-content/uploads/2025/07/appletvos26.jpg?quality=50&strip=all&w=1024 ("tvOS home screen with an F1 trailer at the top"); player with frosted menus: https://b2c-contenthub.com/wp-content/uploads/2025/07/liquidglassvideo.jpg; specular reflection of "00:45" in the Info button: https://b2c-contenthub.com/wp-content/uploads/2025/07/appletvos26reflection.jpg; profile picker: https://b2c-contenthub.com/wp-content/uploads/2025/07/tvos26profileselect.jpg; TV app vertical poster grid: https://b2c-contenthub.com/wp-content/uploads/2025/07/liquidglassappgrid.jpg. Article: https://www.pcworld.com/article/2847724/apple-tv-isnt-changing-much-in-2025.html — verdict: "more distinct borders around buttons and a translucent, frosted effect"; reflections "both impressive to behold and a bit distracting"; "nearly same layout as before."
- Apple TV 4K (2022) press set, tvOS pre-Liquid-Glass: TV+ main menu https://www.apple.com/newsroom/images/product/tv/standard/Apple-TV-4K-TV-Plus-221018_big.jpg.large.jpg ; Siri overlay https://www.apple.com/newsroom/images/product/tv/standard/Apple-TV-4K-Siri-221018_big.jpg.large.jpg ; Music https://www.apple.com/newsroom/images/product/tv/standard/Apple-TV-4K-Music-221018_big.jpg.large.jpg ; full zip https://www.apple.com/newsroom/images/product/tv/standard/Images-of-Apple-TV-4K.zip (article: https://www.apple.com/newsroom/2022/10/apple-introduces-the-powerful-next-generation-apple-tv-4k/)
- Commentary: MacStories overview https://www.macstories.net/news/tvos-26-the-macstories-overview/ ; Six Colors critique of Clear glass over moving video (dimming applied around, not under, the scrubber) https://sixcolors.com/post/2025/06/tvos-26-brings-minor-additions-and-weird-priorities/ ; 9to5Mac (icons "with depth and specular highlights") https://9to5mac.com/?p=1004470 ; TechCrunch https://techcrunch.com/?p=3016891 ; heise (Apple TV HD excluded) https://heise.de/-10438760
- Apple's Destination Video tvOS screenshot with glass over media is embedded in HIG Materials (`materials-tvos-media-player@2x.png`): https://developer.apple.com/design/human-interface-guidelines/materials

---

## 3. PlayStation 5 UI

Layout model. Two home tabs, **Games** and **Media**, replacing the XMB; a horizontal row of large tiles with the focused game's art filling the background. **Control Center** opens over the game with one press of the PS button ("immediate access to almost everything you need from the system at a single press"), without leaving the game. **Activities** are "on-screen cards within the Control Center"; "Some Activity cards can be put in picture-in-picture mode." Sony "rebuilt the entire software stack" for speed. The UI renders in 4K HDR. — https://blog.playstation.com/2020/10/15/first-look-playstation-5s-next-generation-user-experience/

Images: https://blog.playstation.com/tachyon/2020/10/SoP_PGM_PS5UI_Still_Pulse-1.jpg ; https://live.staticflickr.com/65535/50488259263_7f3e75fabd_h.jpg ; https://live.staticflickr.com/65535/50488968796_e25764bf48_h.jpg ; walkthrough video https://www.youtube.com/watch?v=7TBPrYJDoDE ; GTPlanet capture set https://www.gtplanet.net/playstation-5-user-interface-revealed-20201015/

Praised: Games/Media split "de-clutters the UI" (KeenGamer https://keengamer.com/articles/reviews/hardware-reviews/playstation-5-console-review-the-start-of-something-special/); Control Center "works pretty well" (EGM https://egmnow.com/?p=12837); Activity cards as a guide into gameplay (https://www.familygamingdatabase.com/Great+Guidance+From+PlayStation+5+Activity+Cards).
Critiqued: "half-baked UI"; Switcher closes apps instead of suspending; trophies buried (Tom's Guide https://www.tomsguide.com/features/ps5-ui-is-a-mess-heres-what-needs-fixing); "cluttered" at reveal (TNW https://thenextweb.com/gaming/2020/10/15/playstation-5-ui-looks-cooler-than-ps4-but-cluttered/). An April 2026 update reportedly reorganised the top nav bar **[low-authority source: https://meyka.com/blog/playstation-5-ps5-ui-update-finally-fixes-one-of-its-most-annoying-design-issues-2604/]**.

Design lesson for a launcher: full-bleed hero art driven by focus + a thin overlay layer for system functions is the PS5's strongest idea; its weak point is depth of hierarchy for frequent actions.

---

## 4. Other platforms (one paragraph each)

**Google TV (Sept 2025 redesign).** Navigation moved to the top-left as "two pill-shaped clusters" — Home / Live / Apps + search in one, settings + screensaver in the other; "For You" renamed "Home"; profile avatar opens a dropdown with Watchlist, Library, services and content preferences; hero carousel then recommendation rows; rolled out server-side independently of Gemini. Images: https://9to5google.com/wp-content/uploads/sites/4/2025/09/google-tv-homescreen-redesign-2.jpg?quality=82&strip=all&w=1600 ; https://9to5google.com/wp-content/uploads/sites/4/2025/09/google-tv-homescreen-redesign-rollout-1.jpg ; https://9to5google.com/wp-content/uploads/sites/4/2025/09/google-tv-homescreen-redesign-rollout-4.jpg ; https://9to5google.com/wp-content/uploads/sites/4/2025/09/tcl-qm9k-google-tv-homescreen-1.jpg — https://9to5google.com/2025/09/24/google-tv-homescreen-redesign-official-rolling-out-to-more-users/ ; https://www.androidauthority.com/google-tv-home-screen-redesign-testing-3599399 ; https://www.channelnews.com.au/google-tv-moves-navigation-to-top-left-corner-in-first-major-redesign-since-2020/

**Samsung One UI Tizen (2024 → 2026).** Phone-style One UI skin on Tizen 8+: home with "For You" (personalised), Live and Apps tabs; icons became phone-like squircles; settings panel resembles the Galaxy quick panel; Samsung says Home was "redesigned in 2026 for smoother and more seamless navigation" and Vision AI Companion opens via the AI button or long-press Home; seven years of OS updates. Known complaint: default menu scale too small on big panels (fix via Zoom Menu and Text). Sources: https://www.samsung.com/ae/tvs/smart-tv/smart-hub-and-apps/ ; https://www.androidcentral.com/apps-software/samsung-smart-tv-one-ui-update-rollout ; https://www.tomsguide.com/tvs/your-samsung-tv-will-soon-look-and-feel-more-like-your-phone-heres-why ; https://www.sammobile.com/news/our-full-tour-of-2025-samsung-tv-experience-with-improved-one-ui/ (image https://www.sammobile.com/wp-content/uploads/2024/10/Samsung-Q60D-QLED-TV-review-33.jpg).

**Sky Glass / Sky Stream ("Entertainment OS").** Rail-based home: a category rail on top, then content rails (Most Recent, Continue Watching with per-tile progress bars, Playlist, "because you watched", 30 genre rails added in a 2024 update); rails cannot be reordered by users and new rails push Apps/Inputs further down (a recurring forum complaint, March 2026). Reviewer verdict: layout "quite clinical." Sources: https://skygroup.sky/article/sky-announces-entertainment-os-the-system-supporting-sky-glass-sky-stream-as-well-as-new-updates-for-an-even-smarter-experience- (image https://static.skyassets.com/contentstack/assets/blt4b099fa9cc3801a6/blt7890abcc02d1404f/68a318de2cb60c6f3678a6c4/Main-Image-.jpg?downsize=1200:*&output-format=jpg) ; https://www.stuff.tv/?p=965233 ; https://helpforum.sky.com/t5/Sky-Glass/Homescreen-layout-changed/m-p/5227668

**Xbox Series Home (2023).** Top row of game tiles with "Jump back in" (recent games/apps), dedicated system tiles (Settings, Store, Search, My Games & Apps), curated rows below; tiles were shrunk to leave "more room for backgrounds," with "responsive game art" changing the backdrop on hover. Image: https://xboxwire.thesourcemediaassets.com/sites/2/2022/09/Dashboard_Home_For-Xbox-Insiders-Blog_FINAL-cf58d4d6aeb8bb068d71.png — https://news.xbox.com/en-us/?p=186483 ; https://www.thesixthaxis.com/2022/09/08/microsoft-starts-testing-new-xbox-ui-coming-to-all-in-2023/ ; https://www.channelnews.com.au/microsoft-xbox-home-ui-now-available/

**Roku OS.** Left vertical menu + app-tile grid; moved from a 3-column x 4-row grid (12 tiles) to a 4x4 grid (16 tiles) in 2023; users said icons became "smaller and more challenging to read" and asked for the 3x3 back. Image: https://hdtvtest.co.uk/static_data/content/image_2023-08-16_083715194-03090df2-e880-4893-a505-6054435bd3ac.jpg — https://www.hdtvtest.co.uk/news/Roku-is-planning-yet-another-home-screen-revamp ; https://piunikaweb.com/2023/09/11/roku-home-screen-layout-changed-to-4x4-grid-after-latest-update/ ; Roku OS 15 notes https://support.roku.com/article/228844467

**Nvidia Shield TV.** Still Android TV (not Google TV) with the 2021 "Discover" home: Discover / Apps tabs, recommendation rows, a hero; no 2025 home-screen change found; latest software is 9.1.x hotfixes (Nov 2024). https://www.androidcentral.com/nvidia-shield-tv-picsk-up-googles-new-discover-android-homescreen ; https://www.techradar.com/news/nvidia-shield-tv-gets-a-new-os-but-it-isnt-google-tv ; https://9to5google.com/2024/11/25/nvidia-shield-tv-update-third-hotfix-google-home/

---

## 5. Concept work and visionOS glass (best-documented glass language)

### 5.1 visionOS glass facts (WWDC23 10076 "Design for spatial user interfaces" + HIG)

- Windows use "an unmodifiable system-defined material called glass" that "limits the range of background color information" and "automatically adapts to the luminance of the objects and colors behind it"; "visionOS doesn't have a distinct Dark Mode." https://developer.apple.com/design/human-interface-guidelines/materials
- Material hierarchy: thin = interactive elements/selected items; regular = sidebars/grouped sections; thick = dark element on top of regular. "Don't stack lighter materials." Vibrancy levels: label / secondaryLabel / tertiaryLabel. Same URL + https://wwdcnotes.com/documentation/wwdc23-10076-design-for-spatial-user-interfaces/
- Numbers: tap targets "at least 60x60 points"; 44-pt buttons need ≥8 pt around (16 pt between); mini buttons ~28 px need 60 pt of space; lists/menus 4 pt for hover; ornaments overlap the window by 20 pt; tab bar ≤6 items; concentric radius = inner + padding. Body text is semibold by default; weights are heavier than iOS. (wwdcnotes 10076, above; GIGAZINE recap https://gigazine.net/gsc_news/en/20230609-apple-visionos-spatial-user-interfaces)
- Apple still gives no blur/tint/specular numbers. Web approximations commonly start at `backdrop-filter: blur(20px)` **[non-Apple; https://medium.com/@manavkaushal756/engineering-behind-apple-liquid-glass-ui-fb51b1d599ad]**.

### 5.2 Concepts

- Infuse community "Apple TV – Liquid Glass – Redesign" (June 2025; tvOS home with a customisable top nav): https://community.firecore.com/t/apple-tv-liquid-glass-redesign/56003
- ToTheNew engineering write-up of a Liquid-Glass-style blur layer on tvOS (UIVisualEffectView): https://www.tothenew.com/blog/liquid-glass
- Dribbble collections of TV UI (no verified glass-specific shot found; use as browsing seeds): https://dribbble.com/bartonm/collections/3376558-TV-experience ; https://dribbble.com/aaronsmithxd/collections/5081555-TV-App ; https://dribbble.com/impekable/collections/5899320-TV-Apps ; https://dribbble.com/haleyking/collections/5172594-whats-a-TV
- Google's Figma TV design kit (styles, components, patterns): https://www.figma.com/@tv
- No Behance 2025 glass launcher case study was found; search Behance for "tvOS 26" / "Liquid Glass TV".

---

## 6. 10-foot UI rules (non-Apple sources)

**Android TV / Google (developer.android.com)**
- Design canvas **960x540 dp** (1 px = 1 dp at mdpi); 1080p = xhdpi, 4K = xxxhdpi. Overscan margin **5% = 48 dp sides, 27 dp top/bottom** (the Layouts page also prints 58 dp / 28 dp — inconsistent; treat 48/27 as canonical). "Most modern TVs no longer have overscan issues." 12-column grid, columns 52 dp, gutters 20 dp, side space 58 dp. Card widths per row: 1 → 844 dp, 2 → 412, 3 → 268, 4 → 196. Leave padding for focused growth. https://developer.android.com/design/ui/tv/guides/styles/layouts ; https://developer.android.com/training/tv/playback/compose/layouts
- Focus: properties are Scale, Border, Glow, Colors; "Default scaling values are: **1.025, 1.05 and 1.1x**"; glow "ranging from **2dp - 32dp**"; one focused element at a time; D-pad only (arrows, centre, back). https://developer.android.com/design/ui/tv/guides/styles/focus-system
- Compose for TV: Google's Card reference sample overrides with `CardDefaults.scale(focusedScale = 1.05f)` (library default not fetched). https://developer.android.com/reference/kotlin/androidx/tv/material3/Card.composable
- Typography: 15-style scale (Display L/M/S, Headline, Title, Body, Label); "thinner lines are not instantly recognisable"; numbers only in the image. https://developer.android.com/design/ui/tv/guides/styles/typography
- Viewing distance "about 3 meters (10 feet)". https://developer.android.com/design/ui/tv/guides/foundations/design-for-tv

**Amazon Fire TV**
- Design for 1920x1080 (320 dpi, 960x540 dp). Keep UI out of the outer **5%**; focused item and text "fully within the inner 90%." Body text "at least **14sp**, which is approximately 19px on 720p, **28px on 1080p**." Extra line spacing. Every actionable element reachable by D-pad; 1-D lists wrap; focused element must be obvious after looking away; show a momentary selected state on press. https://developer.amazon.com/docs/fire-tv/design-and-user-experience-guidelines.html

**LG webOS (target hardware)**
- "the webOS TV screen has a **20 px** margin area around the edges … place all selectable objects, text, and company branding logos within the safe area." https://webostv.developer.lge.com/develop/guides/overscan (written for webOS 6.0). Legacy LG UI guideline PDF (2014, 1280x720 canvas) https://webostv.developer.lge.com/assets/netcast/LG_Smart_TV_and_Media_Product_UI_Guideline_v4_18.pdf
- Magic Remote: pointer and 5-way coexist; store review fails apps whose pointer handling is incomplete **[third-party: https://www.oxagile.com/article/magic-remote-ux-webos/]**. Apple's rule ("avoid displaying a pointer") must be reconciled: treat pointer hover as a focus-move, never as a separate hover style.

**Smashing Magazine, "Designing for TV" (Milan Balać, 2025)**
- Start body text at **24 px** (web 16–18 px) and scale the type ramp proportionally; 5–6 sizes. Avoid pure #FFF; reserve high contrast for focus. Three focus styles (scale, invert, border), combinable. 12-col grid with 2-col tiles puts the 6th tile outside the safe zone; odd column counts (13) fix it. Shelves: last item "peeks"; 2:3 for film/TV, 16:9 for stills, 1:1 for music/profiles. Vertical = switch group, horizontal = move within group, one press per group change. Long-press accelerates scroll; hold OK for context. Text entry costs ~38 keystrokes vs ~9 on phone. Part 2: https://www.smashingmagazine.com/2025/09/designing-tv-principles-patterns-practical-guidance/ ; Part 1: https://www.smashingmagazine.com/2025/08/designing-tv-evergreen-pattern-shapes-tv-experiences/

**Netflix (observed, not a design post)**: newer TV UI pins the focused tile at the left and scrolls the row under it so the layout "stops jumping around" (Fire TV community observation https://community.firecore.com/t/make-user-interface-similar-to-the-new-netflix-app-interface/58542). Eden Spiekermann on focus: invert colours, bold outlines, "significant changes in size" https://www.edenspiekermann.com/insights/the-10-foot-experience

**Apple tvOS (recap for comparison)**: safe 60/80 pt; 40 pt gutters; 100 pt row gap; 29 pt default / 23 pt min; 2–9 columns.

---

## 7. Typography candidates (open licences, 10-ft legibility)

Sizes are jsDelivr `content-length` for the Fontsource **latin, variable wght** woff2 unless noted (measured 2026-10-27).

| Family | Licence | Axes | Latin variable woff2 | Notes |
|---|---|---|---|---|
| Inter | OFL 1.1 (https://rsms.me/inter/) | wght 100–900, opsz text→display | 48,256 B (`@fontsource-variable/inter` wght); 72,920 B with opsz ("standard") | Closest SF-alike; Inter Display = opsz max; ss01 open digits, tnum, cv11 single-story a |
| Geist | OFL 1.1 (https://github.com/vercel/geist-font) | wght 100–900 | 29,400 B (Fontsource); 56,800 B full `geist@1.3.1` Geist-Variable.woff2 | Söhne-adjacent, Vercel |
| Manrope | OFL | wght 200–800 | 24,836 B | Geometric, warm; good at 29 pt+ |
| Outfit | OFL | wght 100–900 | 32,292 B | Geometric display; weaker for body |
| Instrument Sans | OFL | wght 400–700 | 30,092 B | Compact, slightly quirky |
| Plus Jakarta Sans | OFL | wght 200–800 | 27,348 B | Rounded-geometric |
| Figtree | OFL | wght 300–900 | 20,156 B | Friendly, high x-height |
| Onest | OFL | wght 100–900 | 33,760 B | Neutral grotesk |
| DM Sans | OFL | wght 100–1000, opsz | 36,932 B | Has optical size axis |
| Hanken Grotesk | OFL | wght 100–900 | 34,704 B | Söhne/Akzidenz-flavoured |
| IBM Plex Sans | OFL | static 100–700 (variable on GitHub) | 22,588 B per static weight | Distinctive; wide |
| General Sans | ITF Free Font Licence (Fontshare, `itf_ffl`) | variable wght 200–700 + italic | n/a (Fontshare zip) | Frode Helland / Indian Type Foundry; free incl. commercial, but **not OFL** (no redistribution/modification) — https://www.fontshare.com/fonts/general-sans |
| Satoshi | ITF Free Font Licence | 12 static styles + variable | n/a (Fontshare zip) | Deni Anggara / ITF; same licence caveat — https://www.fontshare.com/fonts/satoshi |

Licence check for Fontshare families: https://www.fontshare.com/licenses/itf-ffl (page is JS-rendered; terms summary **[unverified from fetch]**: free personal + commercial use, web embedding allowed, no modification or resale).

Rendering note: at 1080p the launcher's smallest text should sit at ≥23 pt per Apple, ≥28 px per Amazon; favour Medium/Semibold weights (Apple tvOS styles are Medium by default; visionOS body is semibold).

---

## 8. Motion references

**Apple springs (WWDC23 10158 "Animate with springs")** https://wwdcnotes.com/documentation/wwdc23-10158-animate-with-springs/ ; video https://developer.apple.com/videos/play/wwdc2023/10158/
- Parameters: duration + bounce (bounce −1…1). "When you're not sure, use a spring with bounce 0." ~15% bounce "feels barely bouncy," ~30% noticeably; >0.4 looks exaggerated for UI. Use the perceptual duration, not the settling duration, for follow-on changes. Springs preserve velocity on retarget ("velocity preservation"). Presets `.smooth`, `.snappy` ("predefined duration and small amount of bounce"), `.bouncy`; examples `.spring(duration: 0.6, bounce: 0.2)`, `.snappy(duration: 0.4)`, `.snappy(extraBounce: 0.1)`. https://developer.apple.com/documentation/swiftui/animation/snappy
- Commonly cited preset values smooth 0.5/0, snappy 0.5/0.15, bouncy 0.5/0.3 **[unverified against Apple docs]**.

**Apple "Designing Fluid Interfaces" (WWDC18 803)** — damping ratio 1.0 = no overshoot; response = time-to-target; secondary recap https://medium.com/@nathangitter/building-fluid-interfaces-ios-swift-9732bb934bf5 **[values like damping 0.8 / response 0.3–0.4 are community-reported, unverified]**.

**tvOS system focus timing** — unpublished; read `UIFocusAnimationContext.duration` and derive (e.g. half). https://developer.apple.com/documentation/uikit/uifocusanimationcontext

**HIG Motion** — "In apps, generally avoid adding motion to UI interactions that occur frequently"; "Let people cancel motion"; "Aim for brevity and precision." https://developer.apple.com/design/human-interface-guidelines/motion

**Emil Kowalski, "Great animations"** https://emilkowal.ski/ui/great-animations — "Your animations should also usually be shorter than 300ms"; ease-out for feedback ("starts fast and slows down at the end"); slower, more elegant pieces use `ease`; animate only `transform` and `opacity`; "never animate keyboard initiated actions" (a D-pad is a keyboard); respect `prefers-reduced-motion`; interruptible CSS transitions.

**Rauno Freiberg, "Invisible details of interaction design"** https://rauno.me/craft/interaction-design — reduce motion as frequency rises ("hundreds of times a day"), after "a couple of days they began to feel sluggish"; a "conceptually lighter" element gets less bounce; model interruptibility; Fitts's law (bigger, nearer targets); the ~10 pt icon safe zone artifact during morphs.

**Applied starting values for a TV focus system (derived, not Apple-published)**: focus scale 1.05–1.10 on 410-pt tiles (Google defaults 1.025/1.05/1.1; Apple Top Shelf ratios 1.09–1.14); focus-in faster than focus-out (Apple coordinator behaviour); spring bounce 0–0.15, perceptual duration ≈0.3–0.4 s (Apple snappy range); row scroll with ease-out under 300 ms (Kowalski); no motion on pure D-pad repeats beyond focus movement itself (Freiberg/HIG).

---

## Gaps / what could not be sourced
- No Apple numeric spec for glass blur, tint or shadow; only the 35% dimming layer.
- No Apple-published tvOS focus scale factor or duration.
- No Apple HIG tvOS contrast ratio; use WCAG.
- No current LG webOS typography/pointer design guide beyond the 20 px safe margin page.
- Compose for TV `CardDefaults.scale` default could not be fetched (sample shows 1.05f).
- No 2026 Xbox/Roku/Shield home redesigns found.
- No verified Dribbble/Behance glass TV-launcher shot; only collections and the Infuse community concept.

## User-supplied reference: Nathan Clark's custom TV launcher (X, 2026-10-20/27) — the user loves this

https://x.com/nathanclark/status/2112329341619294527 (photo/1; four option images in the thread). Observed traits, 1798×1009 renders:
- Full-bleed cinematic photography (Golden Gate in fog, Yosemite, foggy pines). The photo is the design; the UI is quiet over it.
- **Dock:** one frosted glass bar (real blur of the photo, lighter than the scene, ~1 px light rim), six cells with **monochrome white brand glyphs** (Stremio diamond, Netflix N, Disney+, YouTube, Apple TV, Prime smile) and a label under each. No colour, no tiles. Focus = the cell gets a lighter glass fill; no scale.
- **Top-left:** small clock "9:41". **Top-right:** three icon+label utilities (Art Mode, All apps, Settings), glyph only in one variant.
- **List variant:** vertical left-aligned list, glyph + wordmark at ~70 px, focused row white, others at ~55% and fading down; works on both photo and pure black.
- Typography: a geometric grotesk close to Geist/Inter Display, medium weight, tight tracking.
- Reading: restraint over spectacle. Nearest of our boards: A (Aerial) for the glass bar, B (Monolith) for the wordmark list; neither had the glyph-only dock.
