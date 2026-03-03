package com.example.fanstatus.util;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class DateTimeUtil {
    private static final DateTimeFormatter DB_FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    public static String format(LocalDateTime dt) {
        if (dt == null) return null;
        return dt.format(DB_FMT);
    }
}
