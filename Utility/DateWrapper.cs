using System;
using System.Collections.Generic;

namespace Utility
{
    public static class DateWrapper
    {
        public static DateTime UnixTimeStampToDateTime(long unixTimeStamp)
        {
            System.DateTime dtDateTime = new DateTime(1970, 1, 1, 0, 0, 0, 0, System.DateTimeKind.Utc);
            dtDateTime = dtDateTime.AddMilliseconds(unixTimeStamp);
            return dtDateTime;
        }

        public static int DateTimeToUnixTimestamp(DateTime dateTime)
        {
            return (TimeZoneInfo.ConvertTimeToUtc(dateTime) -
                   new DateTime(1970, 1, 1, 0, 0, 0, 0, System.DateTimeKind.Utc)).Milliseconds;
        }

        public static Dictionary<string, int> MonthFullNameToNumber =
            new Dictionary<string, int>()
            {
                {"January" , 1},
                {"February", 2},
                {"March", 3},
                {"April", 4},
                {"May", 5},
                {"June", 6},
                {"July", 7},
                {"August", 8},
                {"September", 9},
                {"October", 10},
                {"November", 11},
                {"December", 12}
            };
    }
}
