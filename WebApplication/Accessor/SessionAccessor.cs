using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Web.SessionState;
using System.Globalization;
using garmit.DomainObject;
using garmit.Core;

namespace garmit.Web.Accessor
{
    /// <summary>
    /// セッション変数のAccessor
    /// </summary>
    public class SessionAccessor
    {
        public const string CST_SESSIONKEY_USERID = "UserId";
        public const string CST_SESSIONKEY_SYSTEMID = "SystemId";
        public const string CST_SESSIONKEY_CULTUREINFO = "CultureInfo";
        public const string CST_SESSIONKEY_LOGINTIME = "LoginTime";

        /// <summary>
        /// セッションをセットする
        /// </summary>
        /// <param name="userId"></param>
        /// <param name="systemID"></param>
        public static bool SetSession(string userId, int systemID, CultureInfo cultureInfo, DateTime loginTime)
        {
            bool isSuccess = SetSessionValue(CST_SESSIONKEY_USERID, userId);
            isSuccess = isSuccess ? SetSessionValue(CST_SESSIONKEY_SYSTEMID, systemID) : isSuccess;
            isSuccess = isSuccess ? SetSessionValue(CST_SESSIONKEY_CULTUREINFO, cultureInfo) : isSuccess;
            isSuccess = isSuccess ? SetSessionValue(CST_SESSIONKEY_LOGINTIME, loginTime) : isSuccess;
            return isSuccess;
        }

        /// <summary>
        /// セッション変数からセッションクラスを取得する
        /// </summary>
        /// <returns></returns>
        public static Session GetSession()
        {
            Session session = new Session();

            try
            {
                session.UserId = GetSessionStringValue(CST_SESSIONKEY_USERID);
                session.SystemId = GetSessionIntValue(CST_SESSIONKEY_SYSTEMID);
                session.CultureInfo = GetSessionCultureInfoValue(CST_SESSIONKEY_CULTUREINFO);
                session.LoginTime = GetSessionDateTimeValue(CST_SESSIONKEY_LOGINTIME);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            if (session.UserId != null && session.UserId != "")
            {
                return session;
            }
            else
            {
                return null;
            }

        }

        /// <summary>
        /// セッション変数をクリアする
        /// </summary>
        /// <returns></returns>
        public static void Clear()
        {
            HttpContext.Current.Session.Clear();
        }

        /// <summary>
        /// セッションを破棄する
        /// </summary>
        public static void Abandon()
        {
            HttpContext.Current.Session.Abandon();
            HttpCookie c = new HttpCookie("ASP.NET_SessionId", "");
            HttpContext.Current.Response.Cookies.Add(c);
        }

        /// <summary>
        /// セッション変数にセットする
        /// </summary>
        /// <param name="key">キー文字列</param>
        /// <param name="value">値</param>
        /// <returns>成功/失敗</returns>
        private static bool SetSessionValue(string key, object value)
        {
            try
            {
                HttpContext.Current.Session[key] = value;
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                return false;
            }

            return true;
        }

        /// <summary>
        /// セッション変数の値（文字列）を取得する
        /// </summary>
        /// <param name="key">キー文字列</param>
        /// <returns>セッション変数の値</returns>
        private static string GetSessionStringValue(string key)
        {
            string value = "";

            try
            {
                if (HttpContext.Current.Session[key] != null)
                {
                    value = HttpContext.Current.Session[key].ToString();
                }
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Debug);
            }

            return value;
        }

        /// <summary>
        /// セッション変数の値（short）を取得する
        /// </summary>
        /// <param name="key">キー文字列</param>
        /// <returns>セッション変数の値</returns>
        private static short GetSessionShortValue(string key)
        {
            short value = -999;

            try
            {
                string valStr = GetSessionStringValue(key);
                if (!short.TryParse(valStr, out value))
                {
                    value = -999;
                }
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Debug);
            }

            return value;
        }

        /// <summary>
        /// セッション変数の値（int）を取得する
        /// </summary>
        /// <param name="key">キー文字列</param>
        /// <returns>セッション変数の値</returns>
        private static int GetSessionIntValue(string key)
        {
            int value = -999;

            try
            {
                string valStr = GetSessionStringValue(key);
                if (!int.TryParse(valStr, out value))
                {
                    value = -999;
                }
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Debug);
            }

            return value;
        }

        /// <summary>
        /// セッション変数の値（double）を取得する
        /// </summary>
        /// <param name="key">キー文字列</param>
        /// <returns>セッション変数の値</returns>
        private static double GetSessionDoubleValue(string key)
        {
            double value = -999;

            try
            {
                string valStr = GetSessionStringValue(key);
                if (!double.TryParse(valStr, out value))
                {
                    value = -999;
                }
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Debug);
            }

            return value;
        }

        /// <summary>
        /// セッション変数の値（bool）を取得する
        /// </summary>
        /// <param name="key">キー文字列</param>
        /// <returns>セッション変数の値</returns>
        private static bool GetSessionBoolValue(string key)
        {
            bool value = false;

            try
            {
                if (HttpContext.Current.Session[key] != null)
                {
                    value = (bool)HttpContext.Current.Session[key];
                }
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Debug);
            }

            return value;
        }


        /// <summary>
        /// セッション変数の値（DateTime）を取得する
        /// </summary>
        /// <param name="key">キー文字列</param>
        /// <returns>セッション変数の値</returns>
        private static DateTime GetSessionDateTimeValue(string key)
        {
            DateTime value = DateTime.Now;

            try
            {
                if (HttpContext.Current.Session[key] != null &&
                    HttpContext.Current.Session[key].GetType() == typeof(DateTime))
                {
                    value = (DateTime)HttpContext.Current.Session[key];
                }
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Debug);
            }

            return value;
        }

        /// <summary>
        /// セッション変数の値（CultureInfo）を取得する
        /// </summary>
        /// <param name="key">キー文字列</param>
        /// <returns>セッション変数の値</returns>
        private static CultureInfo GetSessionCultureInfoValue(string key)
        {
            CultureInfo value = new CultureInfo("ja-JP");

            try
            {
                if (HttpContext.Current.Session[key] != null)
                {
                    value = (CultureInfo)HttpContext.Current.Session[key];
                }
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Debug);
            }

            return value;
        }

    }
}