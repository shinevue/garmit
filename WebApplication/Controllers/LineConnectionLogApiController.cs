using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using garmit.DomainObject;
using garmit.Core;
using garmit.Web.Models;
using garmit.Web.Accessor;
using garmit.Web.Filter;
using garmit.Service.LineHist;

namespace garmit.Web.Controllers
{
    /// <summary>
    /// 回線接続履歴画面のAPIコントローラ
    /// </summary>
    [SessionExpireApiFilter]
    [RoutePrefix("api/lineHist")]
    public class LineConnectionLogApiController : ApiController
    {
        /// <summary>
        /// 回線接続履歴サービス
        /// </summary>
        public ILineHistService LineHistService { get; set; }
        
        public LineConnectionLogApiController()
        {
            LineHistService = ServiceManager.GetService<ILineHistService>("LineHistService");
        }

        /// <summary>
        /// 初期データ取得
        /// </summary>
        /// <returns>LookUpの入ったデータ</returns>
        [Route("lookUp")]
        public LookUp GetInitialInfo()
        {
            LineHistInfo info = new LineHistInfo();
            Session session = SessionAccessor.GetSession();

            try
            {
                info = LineHistService.GetLookUp(session);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return info.LookUp;
        }

        /// <summary>
        /// 回線接続履歴を取得
        /// </summary>
        /// <param name="condition"></param>
        /// <returns></returns>
        [Route("search")]
        public LineHistInfo PostSearchLineHists(LineHistInfo lineHistInfo)
        {
            SearchResult searchResult = new SearchResult();
            Session session = SessionAccessor.GetSession();

            try
            {
                searchResult = LineHistService.SearchLineHists(session, lineHistInfo);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }
            
            return new LineHistInfo { LineHistResult = searchResult };
        }



        /// <summary>
        /// 履歴メモ取得
        /// </summary>
        /// <param name="param">履歴ID</param>
        /// <returns></returns>
        [Route("getLineHist")]
        public LineHist PostLineHist(IdIntegerQueryParameter param)
        {
            LineHist lineHist = new LineHist();
            Session session = SessionAccessor.GetSession();

            try
            {
                lineHist = LineHistService.GetLineHist(session, param.Id);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                lineHist = null;
            }

            return lineHist ;
        }

        /// <summary>
        /// 履歴保存
        /// </summary>
        /// <param name="param">履歴ID/履歴メモ/誤登録フラグ</param>
        /// <returns></returns>
        [Route("saveLineHist")]
        public RequestResult SaveLineHist(LineHist param)
        {
            RequestResult result;
            Session session = SessionAccessor.GetSession();

            try
            {
                result = LineHistService.SetLineHist(session, param.HistId, param.Appendix, param.MisReg);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                result = null;
            }

            return result;
        }

        /// <summary>
        /// 履歴一括保存
        /// </summary>
        /// <param name="param">履歴ID/履歴メモ/メモを保存するか/誤登録フラグ/誤登録を保存するか</param>
        /// <returns></returns>
        [Route("saveLineHists")]
        public RequestResult SaveLineHists(LineHistQueryParameter param)
        {
            RequestResult result;
            Session session = SessionAccessor.GetSession();

            try
            {
                result = LineHistService.SetLineHists(session, param.HistIds, param.Appendix, param.IsSaveAppendix,  param.MisReg, param.IsSaveMisReg);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                result = null;
            }

            return result;
        }
    }
}
