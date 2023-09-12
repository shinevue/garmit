using garmit.Core;
using garmit.DomainObject;
using garmit.Service.Authentication;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace garmit.Web.Accessor
{
    /// <summary>
    /// 認証情報アクセッサ
    /// </summary>
    public class AuthenticationAccessor
    {
        public const int CST_AUTHTYPE_HIDE = 0;     //非表示

        /// <summary>
        /// 認証情報を取得する（オーバーロード）
        /// </summary>
        /// <param name="session">セッション情報</param>
        /// <param name="functionId">機能番号</param>
        /// <returns></returns>
        public static AuthenticationInfo GetAuthenticationInfo(int functionId)
        {
            Function.FUNCTION_ID_e functionEnum = (Function.FUNCTION_ID_e)Enum.ToObject(typeof(Function.FUNCTION_ID_e), functionId);
            return GetAuthenticationInfo(functionEnum);
        }

        /// <summary>
        /// 認証情報を取得する（オーバーロード）
        /// </summary>
        /// <param name="session">セッション情報</param>
        /// <param name="functionId">機能番号</param>
        /// <returns></returns>
        public static AuthenticationInfo GetAuthenticationInfo(Function.FUNCTION_ID_e functionId)
        {
            Session session = SessionAccessor.GetSession();
            AuthenticationInfo info = new AuthenticationInfo();
            IAuthenticationService authService = ServiceManager.GetService<IAuthenticationService>("AuthenticationService");

            try
            {
                info = authService.GetSelectedFunctionInfo(session, functionId);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                info = null;
            }

            return info;
        }
    }
}