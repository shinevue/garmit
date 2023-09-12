using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using garmit.DomainObject;
using garmit.Service.LoginUser;
using garmit.Core;
using garmit.Web.Models;
using garmit.Web.Accessor;
using garmit.Web.Filter;
using System.Globalization;

namespace garmit.Web.Controllers
{
    /// <summary>
    /// ユーザー一覧画面のAPIコントローラ
    /// </summary>
    [SessionExpireApiFilter]
    [RoutePrefix("api/User")]
    public class UserApiController : ApiController
    {
        /// <summary>
        /// ログインユーザーサービス
        /// </summary>
        public ILoginUserService LoginUserService { get; set; } 

        public UserApiController()
        {
            LoginUserService = ServiceManager.GetService<ILoginUserService>("LoginUserService");
        }

        /// <summary>
        /// マスターデータを取得する
        /// </summary>
        /// <returns></returns>
        [Route("")]
        public LookUp GetLookUp()
        {
            Session session = SessionAccessor.GetSession();
            UserInfo info = new UserInfo();

            try
            {
                info = LoginUserService.GetLookUp(session);
            }
            catch(Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return info.LookUp;
        }

        /// <summary>
        /// 検索結果を取得する
        /// </summary>
        /// <param name="lookUp"></param>
        /// <returns></returns>
        [Route("getUserResult")]
        public SearchResult PostUserResult(LookUp lookUp)
        {
            Session session = SessionAccessor.GetSession();
            UserInfo info = new UserInfo();

            try
            {
                info = LoginUserService.GetUsers(session, lookUp);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return info.LoginUserResult;
        }

        /// <summary>
        /// ユーザー情報を取得する
        /// </summary>
        /// <param name="lookUp">検索条件</param>
        /// <returns></returns>
        [Route("getUsers")]
        public IEnumerable<LoginUser> PostUserInfo(IEnumerable<string> userIds)
        {
            Session session = SessionAccessor.GetSession();
            UserInfo info = new UserInfo();

            try
            {
                info = LoginUserService.GetUsers(userIds);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }
            
            return info.LoginUsers;
        }

        /// ログイン中ユーザーの情報を取得する
        /// </summary>
        /// <param name="lookUp">検索条件</param>
        /// <returns></returns>
        [Route("getLoginUser")]
        public LoginUser GetLoginUserInfo()
        {
            Session session = SessionAccessor.GetSession();
            UserInfo info = new UserInfo();

            try
            {
                info = LoginUserService.GetUsers(new List<string> { session.UserId });
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                info.LoginUsers = null;
            }

            return info.LoginUsers.FirstOrDefault();
        }

        /// <summary>
        /// ユーザーを登録する
        /// </summary>
        /// <param name="loginUser"></param>
        /// <returns></returns>
        [Route("setUser")]
        public RequestResult PostSetUser(LoginUser loginUser)
        {
            Session session = SessionAccessor.GetSession();
            UserInfo info = new UserInfo();

            try
            {
                info = LoginUserService.SetUser(session, loginUser);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return info.RequestResult;
        }

        [Route("setNewUser")]
        public RequestResult PostSetNewUser(LoginUser loginUser)
        {
            Session session = SessionAccessor.GetSession();
            UserInfo info = new UserInfo();

            try
            {
                // ユーザーIDからユーザーを取得
                info = LoginUserService.GetUsers(new List<string> { loginUser.UserId });
                // ユーザーIDが既に使用されている場合
                if (info.LoginUsers.Count() != 0)
                {
                    return new RequestResult { IsSuccess = false, Message = "入力されたユーザーIDは既に登録されているため、使用できません。" };
                }

                info = LoginUserService.SetUser(session, loginUser);
            }
            catch(Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return info.RequestResult;
        }

        /// <summary>
        /// ユーザー（複数）を登録する
        /// </summary>
        /// <param name="loginUsers"></param>
        /// <returns></returns>
        [Route("setUsers")]
        public RequestResult PostSetUsers(IEnumerable<LoginUser> loginUsers)
        {
            Session session = SessionAccessor.GetSession();
            UserInfo info = new UserInfo();

            try
            {
                info = LoginUserService.SetUsers(session, loginUsers);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return info.RequestResult;
        }

        /// <summary>
        /// ユーザーを削除する
        /// </summary>
        /// <param name="userId"></param>
        /// <returns></returns>
        [Route("deleteUser")]
        public RequestResult GetDeleteUser(string userId)
        {
            Session session = SessionAccessor.GetSession();
            UserInfo info = new UserInfo();

            try
            {
                info = LoginUserService.GetUsers(new List<string> { userId });
                info = LoginUserService.DeleteUser(session, info.LoginUsers.First());
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return info.RequestResult;
        }

        /// <summary>
        /// ユーザー（複数）を削除する
        /// </summary>
        /// <param name="userIds"></param>
        /// <returns></returns>
        [Route("deleteUsers")]
        public RequestResult PostDeleteUsers(IEnumerable<string> userIds)
        {
            Session session = SessionAccessor.GetSession();
            UserInfo info = new UserInfo();

            try
            {
                info = LoginUserService.GetUsers(userIds);
                info = LoginUserService.DeleteUsers(session, info.LoginUsers);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return info.RequestResult;
        }

        /// <summary>
        /// 空のユーザーを取得する
        /// </summary>
        /// <returns></returns>
        [Route("newUser")]
        public LoginUser GetNewUser()
        {
            return new LoginUser ();
        }

        /// <summary>
        /// パスワードを変更する
        /// </summary>
        /// <param name="param">パスワード変更パラメータ</param>
        /// <returns></returns>
        [Route("setPassword")]
        public RequestResult PostSetPassword(SetPasswordParameter param)
        {
            Session session = SessionAccessor.GetSession();
            UserInfo info = new UserInfo();

            try
            {
                info = LoginUserService.SetUserPassword(session, param.NewPassword, param.Password);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                info.RequestResult = GetErrorRequestResult(session.CultureInfo, true);
            }

            return info.RequestResult;
        }

        /// <summary>
        /// ユーザー情報を取得する
        /// </summary>
        /// <param name="param">所属ID</param>
        /// <returns></returns>
        [Route("getUsersByEntId")]
        public IEnumerable<LoginUser> PostGetUsersByEnterpriseIds(IdIntegerQueryParameter param)
        {
            Session session = SessionAccessor.GetSession();
            IEnumerable<LoginUser> loginUsers = new List<LoginUser>();

            try
            {
                loginUsers = LoginUserService.GetUsersByEnterpriseIds(session, new[] { param.Id });
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return loginUsers;
        }

        /// <summary>
        /// エラーリクエスト結果を取得する
        /// </summary>
        /// <param name="cultureInfo">カルチャ情報</param>
        /// <param name="isRegister">データ登録かどうか</param>
        /// <returns>リクエスト結果</returns>
        private RequestResult GetErrorRequestResult(CultureInfo cultureInfo, bool isRegister)
        {
            string messageId = isRegister ? "LoginUser_RegisterError" : "LoginUser_DeleteError";
            return new RequestResult
            {
                IsSuccess = false,
                Message = MessageUtil.GetMessage(messageId, cultureInfo)
            };
        }
    }
}
