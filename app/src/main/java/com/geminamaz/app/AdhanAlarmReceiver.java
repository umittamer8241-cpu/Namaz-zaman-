package com.geminamaz.app;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

public class AdhanAlarmReceiver extends BroadcastReceiver {
    @Override public void onReceive(Context context, Intent intent) {
        if (intent == null) return;
        if (AdhanScheduler.ALARM_ACTION.equals(intent.getAction())) {
            AdhanScheduler.onAlarm(context, intent);
        } else {
            // Re-establish future alarms after reboot, time changes or an exact-alarm grant.
            AdhanScheduler.scheduleNext(context);
        }
    }
}
