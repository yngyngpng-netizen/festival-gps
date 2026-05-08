import Foundation

enum ScheduleParser {
    private struct ParsedRange {
        let startMinute: Int
        let endMinute: Int
        let matchedRange: NSRange
    }

    static func parseSchedule(from text: String, defaultDay: FestivalDay) -> [ScheduleEvent] {
        let lines = text
            .replacingOccurrences(of: "\u{2028}", with: "\n")
            .components(separatedBy: .newlines)
            .map { $0.trimmingCharacters(in: .whitespacesAndNewlines) }
            .filter { !$0.isEmpty }

        let documentDay = day(in: text)
        var events: [ScheduleEvent] = []

        for (index, line) in lines.enumerated() {
            guard let range = parsedTimeRange(in: line) else { continue }

            let previousLine = index > 0 ? lines[index - 1] : nil
            let nextLine = index + 1 < lines.count ? lines[index + 1] : nil
            let context = [previousLine, line, nextLine].compactMap { $0 }.joined(separator: " ")
            let stageID = StageDirectory.stageID(containedIn: context) ?? StageDirectory.defaultStage.id
            let artist = artistName(
                from: line,
                previousLine: previousLine,
                nextLine: nextLine,
                removing: range.matchedRange
            )

            events.append(
                ScheduleEvent(
                    artist: artist,
                    stageID: stageID,
                    day: day(in: line) ?? documentDay ?? defaultDay,
                    startMinute: range.startMinute,
                    endMinute: range.endMinute
                )
            )
        }

        return events.sorted {
            if $0.day == $1.day {
                return $0.startMinute < $1.startMinute
            }
            return $0.day.rawValue < $1.day.rawValue
        }
    }

    static func timeLabel(for minute: Int) -> String {
        let wrappedMinute = minute % (24 * 60)
        let hour24 = wrappedMinute / 60
        let displayMinute = wrappedMinute % 60
        let period = hour24 >= 12 ? "PM" : "AM"
        let hour12 = hour24 % 12 == 0 ? 12 : hour24 % 12
        return "\(hour12):\(String(format: "%02d", displayMinute)) \(period)"
    }

    private static func parsedTimeRange(in line: String) -> ParsedRange? {
        let rangePattern = #"(?i)\b(\d{1,2})(?::(\d{2}))?\s*(AM|PM|A\.M\.|P\.M\.)?\s*(?:-|–|—|to|until|thru|through)\s*(\d{1,2})(?::(\d{2}))?\s*(AM|PM|A\.M\.|P\.M\.)\b"#
        if let match = firstMatch(pattern: rangePattern, in: line), match.numberOfRanges >= 7 {
            let startHour = integer(from: match, at: 1, in: line) ?? 0
            let startMinute = integer(from: match, at: 2, in: line) ?? 0
            let endHour = integer(from: match, at: 4, in: line) ?? 0
            let endMinute = integer(from: match, at: 5, in: line) ?? 0
            let endPeriod = period(from: match, at: 6, in: line) ?? "PM"
            let startPeriod = period(from: match, at: 3, in: line) ?? inferredStartPeriod(
                startHour: startHour,
                endHour: endHour,
                endPeriod: endPeriod
            )

            let start = minutes(hour: startHour, minute: startMinute, period: startPeriod)
            var end = minutes(hour: endHour, minute: endMinute, period: endPeriod)

            if end <= start {
                end += 24 * 60
            }

            return ParsedRange(startMinute: start, endMinute: end, matchedRange: match.range)
        }

        let singlePattern = #"(?i)\b(\d{1,2})(?::(\d{2}))?\s*(AM|PM|A\.M\.|P\.M\.)\b"#
        guard let match = firstMatch(pattern: singlePattern, in: line), match.numberOfRanges >= 4 else {
            return nil
        }

        let hour = integer(from: match, at: 1, in: line) ?? 0
        let minute = integer(from: match, at: 2, in: line) ?? 0
        let meridian = period(from: match, at: 3, in: line) ?? "PM"
        let start = minutes(hour: hour, minute: minute, period: meridian)
        return ParsedRange(startMinute: start, endMinute: start + 60, matchedRange: match.range)
    }

    private static func firstMatch(pattern: String, in line: String) -> NSTextCheckingResult? {
        guard let regex = try? NSRegularExpression(pattern: pattern) else { return nil }
        let range = NSRange(line.startIndex..<line.endIndex, in: line)
        return regex.firstMatch(in: line, range: range)
    }

    private static func integer(from match: NSTextCheckingResult, at index: Int, in line: String) -> Int? {
        guard index < match.numberOfRanges, match.range(at: index).location != NSNotFound else {
            return nil
        }
        let value = (line as NSString).substring(with: match.range(at: index))
        return Int(value)
    }

    private static func period(from match: NSTextCheckingResult, at index: Int, in line: String) -> String? {
        guard index < match.numberOfRanges, match.range(at: index).location != NSNotFound else {
            return nil
        }
        let value = (line as NSString)
            .substring(with: match.range(at: index))
            .uppercased()
            .replacingOccurrences(of: ".", with: "")
        return value == "AM" || value == "PM" ? value : nil
    }

    private static func inferredStartPeriod(startHour: Int, endHour: Int, endPeriod: String) -> String {
        if endPeriod == "AM" && startHour == 12 {
            return "AM"
        }

        if endPeriod == "AM" && startHour >= 6 {
            return "PM"
        }

        if endPeriod == "AM" && startHour > endHour {
            return "PM"
        }

        return endPeriod
    }

    private static func minutes(hour: Int, minute: Int, period: String) -> Int {
        var hour24 = hour % 12
        if period == "PM" {
            hour24 += 12
        }

        var total = hour24 * 60 + minute
        if period == "AM" && total < 12 * 60 {
            total += 24 * 60
        }
        return total
    }

    private static func day(in text: String) -> FestivalDay? {
        let normalized = text.lowercased()

        if normalized.contains("sunday") || normalized.contains("sun ") || normalized.contains("may 17") {
            return .sunday
        }

        if normalized.contains("saturday") || normalized.contains("sat ") || normalized.contains("may 16") {
            return .saturday
        }

        if normalized.contains("friday") || normalized.contains("fri ") || normalized.contains("may 15") {
            return .friday
        }

        return nil
    }

    private static func artistName(
        from line: String,
        previousLine: String?,
        nextLine: String?,
        removing matchedRange: NSRange
    ) -> String {
        let nsLine = line as NSString
        var candidate = nsLine.replacingCharacters(in: matchedRange, with: " ")
        candidate = cleanedArtist(candidate)

        if candidate.isEmpty {
            candidate = [previousLine, nextLine]
                .compactMap { $0 }
                .map(cleanedArtist)
                .first { !$0.isEmpty } ?? ""
        }

        return candidate.isEmpty ? "Imported Set" : candidate
    }

    private static func cleanedArtist(_ rawValue: String) -> String {
        var value = rawValue

        for stage in StageDirectory.stages {
            value = value.replacingOccurrences(of: stage.name, with: " ", options: [.caseInsensitive, .diacriticInsensitive])
        }

        ["Friday", "Saturday", "Sunday", "Fri", "Sat", "Sun", "EDC", "EDC Las Vegas"].forEach {
            value = value.replacingOccurrences(of: $0, with: " ", options: [.caseInsensitive, .diacriticInsensitive])
        }

        return value
            .replacingOccurrences(of: "•", with: " ")
            .replacingOccurrences(of: "|", with: " ")
            .replacingOccurrences(of: "  ", with: " ")
            .trimmingCharacters(in: CharacterSet(charactersIn: "-–—:").union(.whitespacesAndNewlines))
    }
}
