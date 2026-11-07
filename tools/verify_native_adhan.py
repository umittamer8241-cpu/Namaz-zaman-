from pathlib import Path
import xml.etree.ElementTree as ET
root=Path(r'C:\Users\Administrator\Documents\NamazZamani\repo_play_prep')
base=root/'app/src/main'
manifest=ET.parse(base/'AndroidManifest.xml').getroot()
ns='{http://schemas.android.com/apk/res/android}'
permissions={x.attrib.get(ns+'name') for x in manifest.findall('uses-permission')}
required={'android.permission.SCHEDULE_EXACT_ALARM','android.permission.POST_NOTIFICATIONS','android.permission.RECEIVE_BOOT_COMPLETED','android.permission.WAKE_LOCK','android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK'}
assert required <= permissions,required-permissions
app=manifest.find('application')
assert any(x.attrib.get(ns+'name')=='.AdhanPlaybackService' for x in app.findall('service'))
assert any(x.attrib.get(ns+'name')=='.AdhanAlarmReceiver' for x in app.findall('receiver'))
j=base/'java/com/geminamaz/app'
for name in ['MainActivity.java','AdhanScheduler.java','AdhanAlarmReceiver.java','AdhanPlaybackService.java']:
    assert (j/name).is_file()
source=(j/'AdhanScheduler.java').read_text(encoding='utf-8')
assert 'row.optString("recording"' in source and 'isScheduled(settings, scheduled, prayer, recording)' in source
assert 'setExactAndAllowWhileIdle' in source and 'setAndAllowWhileIdle' in source
service=(j/'AdhanPlaybackService.java').read_text(encoding='utf-8')
assert 'getAssets().open("audio/"+source)' in service
assert 'expectedLength' in service
assert 'Foreground' in service
bridge=(j/'MainActivity.java').read_text(encoding='utf-8')
assert 'JSONObject.quote("exact")' in bridge and 'requestAdhanPermissions()' in bridge
version=(root/'app/build.gradle').read_text(encoding='utf-8')
assert 'versionCode 13' in version
assert 'previewAdhan(String prayer, String recording)' in bridge
assert 'openExternalLink(String address)' in bridge
assert 'speakArabic(String text)' in bridge
print('PASS: v0.12 Android manifest, auto alarm, native preview, external sources and Arabic speech bridge.')
