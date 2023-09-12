using garmit.Core;
using garmit.DomainObject;
using garmit.Service.ControlHist;
using garmit.Web.Accessor;
using garmit.Web.Filter;
using System;
using System.Web.Http;

namespace garmit.Web.Controllers
{
    /// <summary>
    /// 制御履歴APIコントローラー
    /// </summary>
    [SessionExpireApiFilter]
    [RoutePrefix("api/controlHist")]
    public class ControlHistApiController : ApiController
    {
        /// <summary>
        /// 制御履歴サービス
        /// </summary>
        public IControlHistService ControlHistService { get; set; }

        /// <summary>
        /// コンストラクタ
        /// </summary>
        public ControlHistApiController()
        {
            ControlHistService = ServiceManager.GetService<IControlHistService>("ControlHistService");
        }

        /// <summary>
        /// 初期データ取得
        /// </summary>
        /// <returns>LookUpの入ったデータ</returns>
        [Route("getLookUp")]
        public LookUp GetInitialInfo()
        {
            ControlHistInfo info = new ControlHistInfo();
            Session session = SessionAccessor.GetSession();

            try
            {
                info = ControlHistService.GetLookUp(session);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                return null;
            }

            return info.LookUp;
        }

        /// <summary>
        /// 制御ログを取得（POST）
        /// </summary>
        /// <param name="condition">検索条件</param>
        /// <returns>制御ログ一覧</returns>
        [Route("getControlLog")]
        public SearchResult PostGetOperationLog(LookUp condition)
        {
            ControlHistInfo info = new ControlHistInfo();
            Session session = SessionAccessor.GetSession();

            try
            {
                info = ControlHistService.GetControlHistList(session, condition);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                return null;
            }

            return info.ControlHistResult;
        }
    }
}
