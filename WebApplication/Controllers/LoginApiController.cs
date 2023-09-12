using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Globalization;
using garmit.DomainObject;
using garmit.Service.Login;
using garmit.Core;
using garmit.Web.Models;
using garmit.Web.Accessor;

namespace garmit.Web.Controllers
{
    /// <summary>
    /// ログイン画面のAPIコントローラ
    /// </summary>
    [RoutePrefix("api/login")]
    public class LoginApiController : ApiController
    {
        /// <summary>
        /// ログインサービス
        /// </summary>
        public ILoginService LoginService { get; set; }
        
        public LoginApiController()
        {
            LoginService = ServiceManager.GetService<ILoginService>("LoginService");
        }

        /// <summary>
        /// ログインを判定する
        /// </summary>
        /// <param name="parameter"></param>
        /// <returns></returns>
        [Route("judgeLogin")]
        public LoginInfo JudgeLogin(LoginQueryParameter parameter)
        {
            LoginInfo info = new LoginInfo();

            try
            {
                // とりあえず日本語で固定
                CultureInfo cultureInfo = new CultureInfo("ja-JP");

                info = LoginService.Login(parameter.UserId, parameter.Password, cultureInfo);

                //ログイン成功したら、セッションにログイン情報を入れる
                if (info != null && info.LoginResult.IsSuccess == true)
                {
                    if (!SessionAccessor.SetSession(parameter.UserId, info.SystemSet.SystemId, cultureInfo, info.LoginDate))
                    {
                        //セッション変数に格納失敗したときはログイン失敗とする
                        info.LoginResult.IsSuccess = false;
                        info.LoginResult.Message = "セッションの記録に失敗しました。再度ログインしてください。";
                    }
                    info.SystemSet = null;  //画面で使用しない情報のため、クリアしておく。
                }
            }
            catch(Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return info;
        }
        
    }
}
