package com.moviereminder

import android.Manifest
import android.content.ContentValues
import android.content.pm.PackageManager
import android.os.Build
import android.provider.CalendarContract
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.modules.core.PermissionAwareActivity
import com.facebook.react.modules.core.PermissionListener
import java.util.TimeZone

class CalendarModule(reactContext: ReactApplicationContext): ReactContextBaseJavaModule(reactContext), PermissionListener {
    override fun getName() = "CalendarModule"

    private var mRequestCode = 0
    private var mCallbacks = HashMap<Int, (grantResults: IntArray?) -> Unit>() // Int : 첫번째 키 - requestCode

    // PERMISSION 수락여부 헨들링
    override fun onRequestPermissionsResult(requestCode: Int, permissions: Array<out String>?, grantResults: IntArray?): Boolean {
        mCallbacks.get(requestCode)?.invoke(grantResults) // 1. requestCode를 가져와서 grantResults를 invoke(실행시킴)
        mCallbacks.remove(requestCode) // 3. grantResults를 실행이 됐으면 이 mCallbacks을 지우고
        return true // 4. 함수가 끝남
    }

    private fun requestPermission(callback: (granted: Boolean) -> Unit) { // Unit: 리턴 아무것도 안해줌
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.M) {
            // PERMISSION 체크
            var status = reactApplicationContext.checkPermission(
                    Manifest.permission.WRITE_CALENDAR,
                    android.os.Process.myPid(),
                    android.os.Process.myUid()
            )
            // PERMISSION 있으면 바로 true 리턴함
            if (status == PackageManager.PERMISSION_GRANTED) {
                callback.invoke(true);
                return
            }
        } else {
            // PERMISSION 체크
            var status = reactApplicationContext.checkSelfPermission(Manifest.permission.WRITE_CALENDAR)
            // PERMISSION 있으면 바로 true 리턴함
            if (status == PackageManager.PERMISSION_GRANTED) {
                callback.invoke(true)
                return
            }
        }
        // PERMISSION 없으면 요청하기
        var activity = currentActivity as PermissionAwareActivity
        mCallbacks.put(mRequestCode, fun(grantResults) { // 2. grantResults가 실행됨 -> PERMISSION이 없으면 requestPermission 여기서 요청하러감
            var granted = grantResults != null && grantResults[0] == PackageManager.PERMISSION_GRANTED // 5. true를 받았으니까
            callback.invoke(granted) // 6. callback을 실행시킴
        })
        activity.requestPermissions(arrayOf(Manifest.permission.WRITE_CALENDAR), mRequestCode, this) // this: requestPermissions 수락 여부에 따라서 이 함수를 처리
        mRequestCode += 1
    }


    @ReactMethod fun createCalendarEvent(timestampInSec: Double, title: String, promise: Promise) {
        try {
            requestPermission(fun (granted) {
                if (!granted) {
                    promise.reject("permission_denied", "Permission is denied")
                    return
                }
                val values = ContentValues().apply {
                    put(CalendarContract.Events.DTSTART, timestampInSec * 1000) // 시작 시간 ex) 2023-05-28T00:00:00
                    put(CalendarContract.Events.DTEND, timestampInSec * 1000 + 24 * 3600 * 1000) // 종료 시간 ex) 2023-05-29T00:00:00
                    put(CalendarContract.Events.TITLE, title)
                    put(CalendarContract.Events.CALENDAR_ID, 1) // 디폴트 캘린더
                    put(CalendarContract.Events.EVENT_TIMEZONE, TimeZone.getDefault().getID())
                }
                val uri = reactApplicationContext.contentResolver.insert(CalendarContract.Events.CONTENT_URI, values)
                promise.resolve(null)
            })
        } catch (error: Throwable) {
            promise.reject("event_failure", error)
        }
    }
}