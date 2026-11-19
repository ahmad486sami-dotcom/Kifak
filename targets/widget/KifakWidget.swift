import WidgetKit
import SwiftUI

// Must match src/lib/widget.ts and app.config.ts
let appGroup = "group.com.kifak.app"
let storageKey = "kifak_widget"

struct Snapshot: Codable {
  var streak: Int = 0
  var todayDone: Bool = false
  var whoseTurn: String = "none"
  var partnerName: String = ""
  var partnerMood: String = ""
  var partnerMoodLabel: String = ""
  var question: String = ""
  var answeredToday: Bool = false
  var countdownTitle: String = ""
  var countdownDate: String = ""
  var togetherSince: String = ""
  var lang: String = "en"

  var ar: Bool { lang == "ar" }

  static func load() -> Snapshot {
    guard let defaults = UserDefaults(suiteName: appGroup),
          let raw = defaults.string(forKey: storageKey),
          let data = raw.data(using: .utf8),
          let snap = try? JSONDecoder().decode(Snapshot.self, from: data) else { return Snapshot() }
    return snap
  }

  var daysTogether: Int? {
    guard !togetherSince.isEmpty else { return nil }
    let f = DateFormatter(); f.dateFormat = "yyyy-MM-dd"
    guard let d = f.date(from: togetherSince) else { return nil }
    return Calendar.current.dateComponents([.day], from: d, to: Date()).day
  }

  var countdownDays: Int? {
    guard !countdownDate.isEmpty else { return nil }
    let iso = ISO8601DateFormatter()
    iso.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
    let d = iso.date(from: countdownDate) ?? ISO8601DateFormatter().date(from: countdownDate)
    guard let date = d else { return nil }
    return max(0, Int(ceil(date.timeIntervalSinceNow / 86400)))
  }

  var turnText: String {
    let n = partnerName.isEmpty ? (ar ? "شريكك" : "your partner") : partnerName
    switch whoseTurn {
    case "both": return ar ? "إنتوا الثنين اليوم ✨" : "Both of you today ✨"
    case "partner": return ar ? "ناطرين \(n)" : "Waiting for \(n)"
    case "you": return ar ? "دورك 👀" : "Your move 👀"
    default: return ar ? "ابدأ شي اليوم" : "Start something today"
    }
  }
}

struct Entry: TimelineEntry {
  let date: Date
  let snap: Snapshot
}

struct Provider: TimelineProvider {
  func placeholder(in context: Context) -> Entry {
    Entry(date: Date(), snap: Snapshot(streak: 12, whoseTurn: "you", partnerName: "Sara", partnerMood: "😊", partnerMoodLabel: "Good", question: "What's a small thing I do that you secretly love?", countdownTitle: "Dinner at the Corniche", togetherSince: "2024-02-14"))
  }
  func getSnapshot(in context: Context, completion: @escaping (Entry) -> Void) {
    completion(context.isPreview ? placeholder(in: context) : Entry(date: Date(), snap: Snapshot.load()))
  }
  func getTimeline(in context: Context, completion: @escaping (Timeline<Entry>) -> Void) {
    let entry = Entry(date: Date(), snap: Snapshot.load())
    // refresh at least every 30 min (and whenever the app calls reloadWidget)
    completion(Timeline(entries: [entry], policy: .after(Date().addingTimeInterval(1800))))
  }
}

let coral = Color(red: 1.0, green: 0.42, blue: 0.42)
let muted = Color(red: 0.66, green: 0.61, blue: 0.70)

extension View {
  @ViewBuilder func kifakBackground() -> some View {
    if #available(iOS 17.0, *) {
      self.containerBackground(for: .widget) {
        LinearGradient(colors: [Color(red: 0.23, green: 0.11, blue: 0.23), Color(red: 0.055, green: 0.043, blue: 0.07)], startPoint: .topLeading, endPoint: .bottomTrailing)
      }
    } else {
      self.background(Color(red: 0.055, green: 0.043, blue: 0.07))
    }
  }
}

// ── Streak ──
struct StreakView: View {
  let e: Entry
  @Environment(\.widgetFamily) var family
  var body: some View {
    switch family {
    case .accessoryCircular:
      ZStack { AccessoryWidgetBackground(); VStack(spacing: 0) { Text("🔥"); Text("\(e.snap.streak)").font(.headline.bold()) } }
    case .accessoryInline:
      Text("🔥 \(e.snap.streak) · \(e.snap.turnText)")
    default:
      VStack(alignment: .leading, spacing: 6) {
        Text("🔥").font(.title)
        Text("\(e.snap.streak)").font(.system(size: 40, weight: .heavy)).foregroundColor(.white)
        Text(e.snap.ar ? "يوم ستريك" : "day streak").font(.caption).foregroundColor(muted)
        Text(e.snap.turnText).font(.caption2.bold()).foregroundColor(coral).lineLimit(2)
      }.frame(maxWidth: .infinity, alignment: .leading).kifakBackground()
    }
  }
}
struct StreakWidget: Widget {
  var body: some WidgetConfiguration {
    StaticConfiguration(kind: "KifakStreak", provider: Provider()) { StreakView(e: $0) }
      .configurationDisplayName("Streak")
      .description("Your shared streak and whose turn it is.")
      .supportedFamilies([.systemSmall, .accessoryCircular, .accessoryInline])
  }
}

// ── Partner mood ──
struct MoodView: View {
  let e: Entry
  var body: some View {
    VStack(alignment: .leading, spacing: 6) {
      Text(e.snap.partnerName.isEmpty ? (e.snap.ar ? "شريكك" : "Partner") : e.snap.partnerName).font(.caption.bold()).foregroundColor(muted)
      Text(e.snap.partnerMood.isEmpty ? "💭" : e.snap.partnerMood).font(.system(size: 44))
      Text(e.snap.partnerMoodLabel.isEmpty ? (e.snap.ar ? "ما في مزاج لسا" : "No mood yet") : e.snap.partnerMoodLabel)
        .font(.subheadline.bold()).foregroundColor(.white).lineLimit(2)
    }.frame(maxWidth: .infinity, alignment: .leading).kifakBackground()
  }
}
struct MoodWidget: Widget {
  var body: some WidgetConfiguration {
    StaticConfiguration(kind: "KifakMood", provider: Provider()) { MoodView(e: $0) }
      .configurationDisplayName("Partner's mood")
      .description("See how your partner feels right now.")
      .supportedFamilies([.systemSmall])
  }
}

// ── Daily question ──
struct QuestionView: View {
  let e: Entry
  var body: some View {
    VStack(alignment: .leading, spacing: 8) {
      Text(e.snap.ar ? "سؤال اليوم" : "TODAY'S QUESTION").font(.caption2.bold()).foregroundColor(coral)
      Text(e.snap.question).font(.headline).foregroundColor(.white).lineLimit(3)
      Spacer(minLength: 0)
      HStack {
        Text("🔥 \(e.snap.streak)").font(.caption.bold()).foregroundColor(.white)
        Spacer()
        Text(e.snap.answeredToday ? (e.snap.ar ? "جاوبت ✓" : "Answered ✓") : (e.snap.ar ? "جاوب لتشوف جوابه" : "Answer to see theirs"))
          .font(.caption).foregroundColor(muted)
      }
    }.frame(maxWidth: .infinity, alignment: .leading).kifakBackground()
  }
}
struct QuestionWidget: Widget {
  var body: some WidgetConfiguration {
    StaticConfiguration(kind: "KifakQuestion", provider: Provider()) { QuestionView(e: $0) }
      .configurationDisplayName("Daily question")
      .description("Today's question for you two.")
      .supportedFamilies([.systemMedium])
  }
}

// ── Countdown ──
struct CountdownView: View {
  let e: Entry
  var body: some View {
    VStack(alignment: .leading, spacing: 6) {
      Text(e.snap.ar ? "الجاي" : "NEXT UP").font(.caption2.bold()).foregroundColor(coral)
      if let d = e.snap.countdownDays {
        Text("\(d)").font(.system(size: 40, weight: .heavy)).foregroundColor(.white)
        Text(e.snap.ar ? "يوم" : (d == 1 ? "day" : "days")).font(.caption).foregroundColor(muted)
        Text(e.snap.countdownTitle).font(.caption.bold()).foregroundColor(.white).lineLimit(2)
      } else {
        Text("📅").font(.system(size: 36))
        Text(e.snap.ar ? "خططوا لموعد" : "Plan a date").font(.subheadline.bold()).foregroundColor(.white)
      }
    }.frame(maxWidth: .infinity, alignment: .leading).kifakBackground()
  }
}
struct CountdownWidget: Widget {
  var body: some WidgetConfiguration {
    StaticConfiguration(kind: "KifakCountdown", provider: Provider()) { CountdownView(e: $0) }
      .configurationDisplayName("Countdown")
      .description("Days until your next date.")
      .supportedFamilies([.systemSmall])
  }
}

// ── Days together ──
struct TogetherView: View {
  let e: Entry
  @Environment(\.widgetFamily) var family
  var body: some View {
    if family == .accessoryCircular {
      ZStack { AccessoryWidgetBackground(); VStack(spacing: 0) { Text("💞"); Text("\(e.snap.daysTogether ?? 0)").font(.caption.bold()) } }
    } else {
      VStack(spacing: 4) {
        Text("💞").font(.title)
        Text("\(e.snap.daysTogether ?? 0)").font(.system(size: 40, weight: .heavy)).foregroundColor(.white)
        Text(e.snap.ar ? "يوم سوا" : "days together").font(.caption).foregroundColor(muted)
      }.frame(maxWidth: .infinity).kifakBackground()
    }
  }
}
struct TogetherWidget: Widget {
  var body: some WidgetConfiguration {
    StaticConfiguration(kind: "KifakTogether", provider: Provider()) { TogetherView(e: $0) }
      .configurationDisplayName("Days together")
      .description("How long you've been together.")
      .supportedFamilies([.systemSmall, .accessoryCircular])
  }
}

@main
struct KifakWidgets: WidgetBundle {
  var body: some Widget {
    StreakWidget()
    MoodWidget()
    QuestionWidget()
    CountdownWidget()
    TogetherWidget()
  }
}
