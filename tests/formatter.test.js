import * as formatter from "src/common/formatter";

describe("Formatter Functions", () => {
  describe("formatBigNumber", () => {
    test("should format small numbers correctly", () => {
      expect(formatter.formatBigNumber(99)).toBe("99");
      expect(formatter.formatBigNumber(100)).toBe("100");
    });

    test("should format thousands correctly", () => {
      expect(formatter.formatBigNumber(1000)).toBe("1千");
      expect(formatter.formatBigNumber(9999)).toBe("1万");
    });

    test("should format ten thousands correctly", () => {
      expect(formatter.formatBigNumber(10000)).toBe("1万");
      expect(formatter.formatBigNumber(99999)).toBe("1十万");
    });

    test("should format hundred thousands correctly", () => {
      expect(formatter.formatBigNumber(100000)).toBe("1十万");
      expect(formatter.formatBigNumber(999999)).toBe("1百万");
    });

    test("should format millions correctly", () => {
      expect(formatter.formatBigNumber(1000000)).toBe("1百万");
      expect(formatter.formatBigNumber(9999999)).toBe("1千万");
    });

    test("should format ten millions correctly", () => {
      expect(formatter.formatBigNumber(10000000)).toBe("1千万");
      expect(formatter.formatBigNumber(99999999)).toBe("1亿");
    });

    test("should format hundred millions correctly", () => {
      expect(formatter.formatBigNumber(100000000)).toBe("1亿");
      expect(formatter.formatBigNumber(999999999)).toBe("1十亿");
    });

    test("should format very large numbers with scientific notation", () => {
      expect(formatter.formatBigNumber(1000000000000000)).toBe("1*10^15");
    });

    test("should handle edge cases", () => {
      expect(formatter.formatBigNumber(0)).toBe("0");
      expect(formatter.formatBigNumber(1)).toBe("1");
    });
  });

  describe("formatInt", () => {
    test("should format integers with commas", () => {
      expect(formatter.formatInt(1000)).toBe("1,000");
      expect(formatter.formatInt(10000)).toBe("10,000");
      expect(formatter.formatInt(100000)).toBe("100,000");
      expect(formatter.formatInt(1000000)).toBe("1,000,000");
      expect(formatter.formatInt(12345678)).toBe("12,345,678");
    });

    test("should handle small numbers", () => {
      expect(formatter.formatInt(100)).toBe("100");
      expect(formatter.formatInt(99)).toBe("99");
      expect(formatter.formatInt(1)).toBe("1");
    });

    test("should handle edge cases", () => {
      expect(formatter.formatInt(0)).toBe("0");
      expect(formatter.formatInt(-1000)).toBe("-1,000");
      expect(formatter.formatInt(-12345)).toBe("-12,345");
    });
  });

  describe("fixedFloat", () => {
    test("should format floats with default 2 decimal places", () => {
      expect(formatter.fixedFloat(3.14159)).toBe("3.14");
      expect(formatter.fixedFloat(2.999)).toBe("3");
      expect(formatter.fixedFloat(1.001)).toBe("1");
    });

    test("should format floats with custom decimal places", () => {
      expect(formatter.fixedFloat(3.14159, 3)).toBe("3.142");
      expect(formatter.fixedFloat(3.14159, 1)).toBe("3.1");
      expect(formatter.fixedFloat(3.14159, 0)).toBe("3");
    });

    test("should handle integers", () => {
      expect(formatter.fixedFloat(5)).toBe("5");
      expect(formatter.fixedFloat(100)).toBe("100");
    });

    test("should handle edge cases", () => {
      expect(formatter.fixedFloat(0)).toBe("0");
      expect(formatter.fixedFloat(0.1)).toBe("0.1");
      expect(formatter.fixedFloat(0.01)).toBe("0.01");
    });

    test("should handle null and undefined", () => {
      expect(formatter.fixedFloat(null)).toBe("");
      expect(formatter.fixedFloat(undefined)).toBe("undefined");
      expect(formatter.fixedFloat("")).toBe("");
    });

    test("should handle NaN", () => {
      expect(formatter.fixedFloat(NaN)).toBe("NaN");
    });
  });

  describe("formatFloat", () => {
    test("should format floats with commas", () => {
      expect(formatter.formatFloat(1234.56)).toBe("1,234.56");
      expect(formatter.formatFloat(1234567.89)).toBe("1,234,567.89");
      expect(formatter.formatFloat(123456789.123)).toBe("123,456,789.12");
    });

    test("should handle integers", () => {
      expect(formatter.formatFloat(1000)).toBe("1,000");
      expect(formatter.formatFloat(1234567)).toBe("1,234,567");
    });

    test("should handle small numbers", () => {
      expect(formatter.formatFloat(100)).toBe("100");
      expect(formatter.formatFloat(99.99)).toBe("99.99");
    });

    test("should handle zero", () => {
      expect(formatter.formatFloat(0)).toBe(0);
    });

    test("should handle null and undefined", () => {
      expect(formatter.formatFloat(null)).toBe("undefined");
      expect(formatter.formatFloat(undefined)).toBe("undefined");
    });

    test("should handle negative numbers", () => {
      expect(formatter.formatFloat(-1234.56)).toBe("-1,234.56");
      expect(formatter.formatFloat(-1000)).toBe("-1,000");
    });
  });

  describe("formatByte", () => {
    test("should format bytes correctly", () => {
      expect(formatter.formatByte(500)).toBe("500 B");
      expect(formatter.formatByte(1023)).toBe("1023 B");
    });

    test("should format kilobytes correctly", () => {
      expect(formatter.formatByte(1024)).toBe("1 KB");
      expect(formatter.formatByte(2048)).toBe("2 KB");
      expect(formatter.formatByte(1536)).toBe("1.5 KB");
    });

    test("should format megabytes correctly", () => {
      expect(formatter.formatByte(1024 * 1024)).toBe("1 MB");
      expect(formatter.formatByte(1024 * 1024 * 2.5)).toBe("2.5 MB");
    });

    test("should format gigabytes correctly", () => {
      expect(formatter.formatByte(1024 * 1024 * 1024)).toBe("1 GB");
      expect(formatter.formatByte(1024 * 1024 * 1024 * 1.5)).toBe("1.5 GB");
    });

    test("should format terabytes correctly", () => {
      expect(formatter.formatByte(1024 * 1024 * 1024 * 1024)).toBe("1 TB");
      expect(formatter.formatByte(1024 * 1024 * 1024 * 1024 * 2.5)).toBe("2.5 TB");
    });

    test("should handle edge cases", () => {
      expect(formatter.formatByte(0)).toBe("0 B");
      expect(formatter.formatByte(1)).toBe("1 B");
    });
  });

  describe("formatBit", () => {
    test("should format bits correctly", () => {
      expect(formatter.formatBit(500)).toBe("500 bps");
      expect(formatter.formatBit(999)).toBe("999 bps");
    });

    test("should format kilobits correctly", () => {
      expect(formatter.formatBit(1000)).toBe("1 Kbps");
      expect(formatter.formatBit(2000)).toBe("2 Kbps");
      expect(formatter.formatBit(1500)).toBe("1.5 Kbps");
    });

    test("should format megabits correctly", () => {
      expect(formatter.formatBit(1000 * 1000)).toBe("1 Mbps");
      expect(formatter.formatBit(1000 * 1000 * 2.5)).toBe("2.5 Mbps");
    });

    test("should format gigabits correctly", () => {
      expect(formatter.formatBit(1000 * 1000 * 1000)).toBe("1 Gbps");
      expect(formatter.formatBit(1000 * 1000 * 1000 * 1.5)).toBe("1.5 Gbps");
    });

    test("should format terabits correctly", () => {
      expect(formatter.formatBit(1000 * 1000 * 1000 * 1000)).toBe("1 Tbps");
      expect(formatter.formatBit(1000 * 1000 * 1000 * 1000 * 2.5)).toBe("2.5 Tbps");
    });

    test("should handle edge cases", () => {
      expect(formatter.formatBit(0)).toBe("0 bps");
      expect(formatter.formatBit(1)).toBe("1 bps");
    });
  });

  describe("formatPercentage", () => {
    test("should format percentages correctly", () => {
      expect(formatter.formatPercentage(0.5)).toBe("50%");
      expect(formatter.formatPercentage(0.25)).toBe("25%");
      expect(formatter.formatPercentage(1)).toBe("100%");
      expect(formatter.formatPercentage(0.123)).toBe("12.3%");
    });

    test("should handle negative percentages", () => {
      expect(formatter.formatPercentage(-0.5)).toBe("-50%");
      expect(formatter.formatPercentage(-0.25)).toBe("-25%");
    });

    test("should handle absolute values when isAbs is true", () => {
      expect(formatter.formatPercentage(-0.5, true)).toBe("50%");
      expect(formatter.formatPercentage(-0.25, true)).toBe("25%");
      expect(formatter.formatPercentage(0.5, true)).toBe("50%");
    });

    test("should handle edge cases", () => {
      expect(formatter.formatPercentage(0)).toBe("0%");
      expect(formatter.formatPercentage(0.001)).toBe("0.1%");
      expect(formatter.formatPercentage(0.0001)).toBe("0.01%");
    });

    test("should handle null and undefined", () => {
      expect(formatter.formatPercentage(null)).toBe("");
      expect(formatter.formatPercentage(undefined)).toBe("undefined");
      expect(formatter.formatPercentage("")).toBe("");
    });

    test("should handle large percentages", () => {
      expect(formatter.formatPercentage(2.5)).toBe("250%");
      expect(formatter.formatPercentage(10)).toBe("1000%");
    });
  });

  describe("formatSecondsToStr", () => {
    test("should format seconds correctly", () => {
      expect(formatter.formatSecondsToStr(30)).toBe("30秒");
      expect(formatter.formatSecondsToStr(59)).toBe("59秒");
    });

    test("should format minutes correctly", () => {
      expect(formatter.formatSecondsToStr(60)).toBe("1分钟0秒");
      expect(formatter.formatSecondsToStr(90)).toBe("1分钟30秒");
      expect(formatter.formatSecondsToStr(3599)).toBe("59分钟59秒");
    });

    test("should format hours correctly", () => {
      expect(formatter.formatSecondsToStr(3600)).toBe("1小时0分钟0秒");
      expect(formatter.formatSecondsToStr(3661)).toBe("1小时1分钟1秒");
      expect(formatter.formatSecondsToStr(7200)).toBe("2小时0分钟0秒");
    });

    test("should format days correctly", () => {
      expect(formatter.formatSecondsToStr(86400)).toBe("1天0小时0分钟0秒");
      expect(formatter.formatSecondsToStr(90061)).toBe("1天1小时1分钟1秒");
      expect(formatter.formatSecondsToStr(172800)).toBe("2天0小时0分钟0秒");
    });

    test("should handle complex time combinations", () => {
      expect(formatter.formatSecondsToStr(93784)).toBe("1天2小时3分钟4秒");
      expect(formatter.formatSecondsToStr(266344)).toBe("3天1小时59分钟4秒");
    });

    test("should handle edge cases", () => {
      expect(formatter.formatSecondsToStr(0)).toBe("0秒");
      expect(formatter.formatSecondsToStr(1)).toBe("1秒");
    });

    test("should handle null", () => {
      expect(formatter.formatSecondsToStr(null)).toBe("-");
    });

    test("should handle large time values", () => {
      expect(formatter.formatSecondsToStr(31536000)).toBe("365天0小时0分钟0秒"); // 1年
    });
  });
});
