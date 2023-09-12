using garmit.Core;
using garmit.DomainObject;
using garmit.Service.ICCard;
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
    /// ICカードサービス用APIコントローラ
    /// </summary>
    [SessionExpireApiFilter]
    [RoutePrefix("api/icCard")]
    public class ICCardApiController : ApiController
    {

        /// <summary>
        /// ICカードサービス
        /// </summary>
        public IICCardService ICCardService { get; set; }

        public ICCardApiController()
        {
            ICCardService = ServiceManager.GetService<IICCardService>("ICCardService");
        }
        
        /// <summary>
        /// ICカード画面の初期情報取得
        /// </summary>
        /// <returns>ControlInfo.LookUp</returns>
        [Route("")]
        public LookUp GetLookUp()
        {
            LookUp lookUp = new LookUp();
            Session session = SessionAccessor.GetSession();

            try
            {
                lookUp = ICCardService.GetLookUp(session);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                return null;
            }
            return lookUp;
        }

        /// <summary>
        /// ICカード検索
        /// </summary>
        /// <param name="param">検索条件</param>
        /// <returns>検索結果</returns>
        [Route("getIcCardResult")]
        public SearchResult PostGetICCardResult(ICCardQueryParameter param)
        {
            SearchResult result = new SearchResult();
            Session session = SessionAccessor.GetSession();

            try
            {
                result = ICCardService.SearchICCards(session, param.LookUp, param.ICCardCondition);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                return null;
            }
            return result;
        }

        /// <summary>
        /// ICカード情報取得
        /// </summary>
        /// <param name="param">カードID</param>
        /// <returns>ICカード情報</returns>
        [Route("getIcCard")]
        public ICCard PostGetICCardForm(IdIntegerQueryParameter param)
        {
            ICCard icCard = new ICCard();
            Session session = SessionAccessor.GetSession();
            try
            {
                icCard = ICCardService.GetICCard(session, param.Id);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                return null;
            }
            return icCard;
        }

        /// <summary>
        /// ICカード情報取得（複数）
        /// </summary>
        /// <param name="cardIds">カードIDリスト</param>
        /// <returns>ICカード情報</returns>
        [Route("getIcCards")]
        public IEnumerable<ICCard> PostGetICCardForm(IEnumerable<int> cardIds)
        {
            IEnumerable<ICCard> icCards = new List<ICCard>();
            Session session = SessionAccessor.GetSession();
            try
            {
                icCards = ICCardService.GetICCards(session, cardIds);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                return null;
            }
            return icCards;
        }

        /// <summary>
        /// ICカード保存
        /// </summary>
        /// <param name="iCCard">ICカード</param>
        /// <returns>保存結果</returns>
        [Route("setIcCard")]
        public RequestResult PostSetICCard(ICCard icCard)
        {
            RequestResult result = new RequestResult();
            Session session = SessionAccessor.GetSession();
            try
            {
                result = ICCardService.SetICCard(session, icCard);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                return GetErrorRequestResult(session.CultureInfo, true);
            }
            return result;
        }

        /// <summary>
        /// ICカード複数保存
        /// </summary>
        /// <param name="iCCard">ICカード</param>
        /// <returns>保存結果</returns>
        [Route("setIcCards")]
        public RequestResult PostSetICCards(IEnumerable<ICCard> icCards)
        {
            RequestResult result = new RequestResult();
            Session session = SessionAccessor.GetSession();
            try
            {
                result = ICCardService.SetICCards(session, icCards);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                return GetErrorRequestResult(session.CultureInfo, true);
            }
            return result;
        }

        /// <summary>
        /// ICカード削除
        /// </summary>
        /// <param name="cardIds">カードIDリスト</param>
        /// <returns>削除結果</returns>
        [Route("deleteIcCards")]
        public RequestResult PostDeleteICCards(IEnumerable<int> cardIds)
        {
            RequestResult result = new RequestResult();
            Session session = SessionAccessor.GetSession();
            try
            {
                result = ICCardService.DeleteICCards(session, cardIds);
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
            string messageId = isRegister ? "ICCard_RegisterError" : "ICCard_DeleteError";
            return new RequestResult
            {
                IsSuccess = false,
                Message = MessageUtil.GetMessage(messageId, cultureInfo)
            };
        }

        #endregion
    }
}
