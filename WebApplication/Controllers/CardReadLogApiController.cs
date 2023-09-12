using garmit.Core;
using garmit.DomainObject;
using garmit.Service.ICCardReadHist;
using garmit.Web.Accessor;
using garmit.Web.Filter;
using garmit.Web.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace garmit.Web.Controllers
{
    /// <summary>
    /// カード読み取りログAPIコントローラー
    /// </summary>
    [SessionExpireApiFilter]
    [RoutePrefix("api/cardReadLog")]
    public class CardReadLogApiController : ApiController
    {
        /// <summary>
        /// ICカードサービス
        /// </summary>
        public IICCardReadHistService ICCardReadHistService { get; set; }

        /// <summary>
        /// コンストラクタ
        /// </summary>
        public CardReadLogApiController()
        {
            ICCardReadHistService = ServiceManager.GetService<IICCardReadHistService>("ICCardReadHistService");
        }

        /// <summary>
        /// 初期データ取得
        /// </summary>
        /// <returns>LookUpの入ったデータ</returns>
        [Route("")]
        public LookUp GetInitialInfo()
        {
            LookUp lookUp = new LookUp();
            Session session = SessionAccessor.GetSession();

            try
            {
                lookUp = ICCardReadHistService.GetLookUp(session);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                return null;
            }
            return lookUp;
        }

        /// <summary>
        /// ICカード読み取り履歴検索
        /// </summary>
        /// <param name="param">検索条件</param>
        /// <returns>検索結果</returns>
        [Route("search")]
        public SearchResult PostGetICCardResult(ICCardQueryParameter param)
        {
            SearchResult result = new SearchResult();
            Session session = SessionAccessor.GetSession();

            try
            {
                result = ICCardReadHistService.SearchICCardReadHists(session, param.LookUp, param.ICCardCondition);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                return null;
            }
            return result;
        }

    }
}
