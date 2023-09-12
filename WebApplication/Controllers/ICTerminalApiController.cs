using garmit.Core;
using garmit.DomainObject;
using garmit.Service.ICTerminal;
using garmit.Web.Accessor;
using garmit.Web.Filter;
using garmit.Web.Models;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace garmit.Web.Controllers
{
    /// <summary>
    /// ラック施開錠端末サービス用APIコントローラ
    /// </summary>
    [SessionExpireApiFilter]
    [RoutePrefix("api/icTerminal")]
    public class ICTerminalApiController : ApiController
    {
        /// <summary>
        /// ラック施開錠端末サービス
        /// </summary>
        public IICTerminalService ICTerminalService { get; set; }

        /// <summary>
        /// コンストラクタ
        /// </summary>
        public ICTerminalApiController()
        {
            ICTerminalService = ServiceManager.GetService<IICTerminalService>("ICTerminalService");
        }

        /// <summary>
        /// マスタデータ取得
        /// </summary>
        /// <returns>LookUpの入ったデータ</returns>
        [Route("getLookUp")]
        public LookUp GetLookUp()
        {
            LookUp lookUp = new LookUp();
            Session session = SessionAccessor.GetSession();

            try
            {
                lookUp = ICTerminalService.GetLookUp(session);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                return null;
            }
            return lookUp;
        }

        /// <summary>
        /// ラック施開錠端末一覧取得
        /// </summary>
        /// <returns>ラック施開錠端末一覧</returns>
        [Route("getICTerminalResult")]
        public SearchResult GetICTerminalResult()
        {
            SearchResult result = new SearchResult();
            Session session = SessionAccessor.GetSession();

            try
            {
                result = ICTerminalService.SearchICTerminals(session);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                return null;
            }
            return result;
        }


        /// <summary>
        /// ラック施開錠端末情報取得
        /// </summary>
        /// <param name="param">端末番号</param>
        /// <returns>ラック施開錠端末情報</returns>
        [Route("getIcTerminal")]
        public ICTerminal PostGetICCardForm(IdIntegerQueryParameter param)
        {
            ICTerminal icTerminal = new ICTerminal();
            Session session = SessionAccessor.GetSession();
            try
            {
                icTerminal = ICTerminalService.GetICTerminal(session, param.Id);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                return null;
            }
            return icTerminal;
        }

        /// <summary>
        /// ラック施開錠端末保存
        /// </summary>
        /// <param name="icTerminal">ラック施開錠端末情報</param>
        /// <returns>保存結果</returns>
        [Route("setIcTerminal")]
        public RequestResult PostSetICTerminal(ICTerminal icTerminal)
        {
            RequestResult result = new RequestResult();
            Session session = SessionAccessor.GetSession();
            try
            {
                result = ICTerminalService.SetICTerminal(session, icTerminal);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                return GetErrorRequestResult(session.CultureInfo, true);
            }
            return result;
        }

        /// <summary>
        /// ラック施開錠端末削除
        /// </summary>
        /// <param name="termNos">端末番号リスト</param>
        /// <returns>削除結果</returns>
        [Route("deleteIcTerminals")]
        public RequestResult PostDeleteICTerminalsｘ(IEnumerable<int> termNos)
        {
            RequestResult result = new RequestResult();
            Session session = SessionAccessor.GetSession();
            try
            {
                result = ICTerminalService.DeleteICTerminals(session, termNos);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                return GetErrorRequestResult(session.CultureInfo, false);
            }
            return result;
        }

        #region private

        /// <summary>
        /// エラーリクエスト結果を取得する
        /// </summary>
        /// <param name="cultureInfo">カルチャ情報</param>
        /// <param name="isRegister">データ登録かどうか</param>
        /// <returns>リクエスト結果</returns>
        private RequestResult GetErrorRequestResult(CultureInfo cultureInfo, bool isRegister)
        {
            string messageId = isRegister ? "ICTerminal_RegisterError" : "ICTerminal_DeleteError";
            return new RequestResult
            {
                IsSuccess = false,
                Message = MessageUtil.GetMessage(messageId, cultureInfo)
            };
        }

        #endregion
    }
}
