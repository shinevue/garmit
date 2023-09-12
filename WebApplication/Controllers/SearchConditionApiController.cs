using garmit.Core;
using garmit.DomainObject;
using garmit.Service.SearchCondition;
using garmit.Web.Accessor;
using garmit.Web.Filter;
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
    /// 検索条件のAPIコントローラ
    /// </summary>
    [SessionExpireApiFilter]
    [RoutePrefix("api/searchCondition")]
    public class SearchConditionApiController : ApiController
    {

        public ISearchConditionService SearchConditionService { get; set; }

        public SearchConditionApiController()
        {
            SearchConditionService = ServiceManager.GetService<ISearchConditionService>("SearchConditionService");
        }

        /// <summary>
        /// 登録済み検索条件一覧を取得する
        /// </summary>
        /// <param name="parameter"></param>
        /// <returns></returns>
        [Route("getList")]
        public IEnumerable<SearchCondition> PostGetSearchConditions(SearchCondition condition)
        {
            IEnumerable<SearchCondition> searchConditions = null;
            Session session = SessionAccessor.GetSession();

            try
            {
                searchConditions = SearchConditionService.GetSearchConditions(session, (int)condition.FunctionId);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return searchConditions;
        }

        /// <summary>
        /// 登録済み検索条件一覧を取得する
        /// </summary>
        /// <param name="parameter"></param>
        /// <returns></returns>
        [Route("get")]
        public SearchCondition PostGetSearchCondition(SearchCondition condition)
        {
            SearchCondition searchCondition = null;
            Session session = SessionAccessor.GetSession();

            try
            {
                searchCondition = SearchConditionService.GetSearchCondition(session, (int)condition.FunctionId, condition.SaveDate);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return searchCondition;
        }

        /// <summary>
        /// 検索条件情報を保存する
        /// </summary>
        /// <param name="userColumnMapping"></param>
        /// <returns></returns>
        [Route("set")]
        public RequestResult PostSetSearchCondition(SearchCondition condition)
        {
            RequestResult result;
            Session session = SessionAccessor.GetSession();

            try
            {
                result = SearchConditionService.SetSearchCondition(session, condition);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                result = GetErrorRequestResult(session.CultureInfo);
            }

            return result;
        }

        #region private

        /// <summary>
        /// エラーリクエスト結果を取得する
        /// </summary>
        /// <param name="cultureInfo">カルチャ情報</param>
        /// <returns>リクエスト結果</returns>
        private RequestResult GetErrorRequestResult(CultureInfo cultureInfo)
        {
            return new RequestResult
            {
                IsSuccess = false,
                Message = MessageUtil.GetMessage("SearchCondition_RegisterError", cultureInfo)
            };
        }

        #endregion
    }
}
