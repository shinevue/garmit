using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Http.Controllers;
using System.Web.Http.Filters;
using garmit.Core;
using garmit.Web.Accessor;
using System.Net.Http;
using System.Net;
using System.Web.Http;
using System.Web.Http.Results;

namespace garmit.Web.Filter
{
    /// <summary>
    /// セッションタイムアウトフィルター（API用）
    /// </summary>
    public class SessionExpireApiFilterAttribute: ActionFilterAttribute
    {
        /// <summary>
        /// セッションタイムアウトエラーのhttpステータスコード。httpコードに適切なコードがないため、440にする。
        /// </summary>
        private const int HTTP_CODE_SESSIONERROR = 440;

        /// <summary>
        /// アクションメソッド実行前に発生する。（オーバーライド）
        /// </summary>
        /// <param name="actionExecutedContext">アクションコンテキスト</param>
        public override void OnActionExecuting(HttpActionContext actionContext)
        {
            HttpContext context = HttpContext.Current;
            bool isTimeout = false;

            if (context.Session != null)
            {
                if (context.Session.IsNewSession)
                {
                    string sessionCookie = context.Request.Headers["Cookie"];
                    if (sessionCookie != null && sessionCookie.IndexOf("ASP.NET_SessionId") >= 0)
                    {
                        isTimeout = true;
                    }
                }
                else
                {
                    if (context.Session[SessionAccessor.CST_SESSIONKEY_USERID] == null)
                    {
                        isTimeout = true;
                    }
                }
            }

            if (isTimeout)
            {
                Logger.Instance.LogMessage("セッションタイムアウト", Logger.LogLevel.Debug);
                actionContext.Response = new HttpResponseMessage((HttpStatusCode)HTTP_CODE_SESSIONERROR);
            }
            base.OnActionExecuting(actionContext);
        }
    }
}