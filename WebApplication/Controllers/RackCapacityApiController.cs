using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using garmit.Web.Models;
using garmit.DomainObject;
using garmit.Web.Accessor;
using garmit.Core;
using garmit.Service.RackCapacity;
using garmit.Model.LoginUser;
using garmit.Web.Filter;

namespace garmit.Web.Controllers
{
    /// <summary>
    /// ラックキャパシティのAPIコントローラ
    /// </summary>
    [SessionExpireApiFilter]
    [RoutePrefix("api/rackCapacity")]
    public class RackCapacityApiController : ApiController
    {
        /// <summary>
        /// ラックキャパシティサービス
        /// </summary>
        public IRackCapacityService RackCapacityService { get; set; }

        /// <summary>
        /// コンストラクタ
        /// </summary>
        public RackCapacityApiController()
        {
            RackCapacityService = ServiceManager.GetService<IRackCapacityService>("RackCapacityService");
        }

        /// <summary>
        /// 初期表示情報取得
        /// </summary>
        /// <returns></returns>
        [Route("")]
        public RackCapacityInfo GetInitialInfo()
        {
            RackCapacityInfo info = new RackCapacityInfo();
            Session session = SessionAccessor.GetSession();
            try
            {
                info = RackCapacityService.GetLookUp(session);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                return null;
            }
            return info;
        }

        /// <summary>
        /// 空きラック群情報を取得する
        /// </summary>
        /// <param name="emptyRackCount">検索する連続空きラック数</param>
        /// <param name="rackType">ラック種別</param>
        /// <param name="layout">表示中のレイアウト</param>
        /// <returns></returns>
        [Route("emptyRack")]
        public RackCapacityInfo SearchEmptyRackInfo(SearchEmptyRacksParameter parameter)
        {
            RackCapacityInfo info = new RackCapacityInfo();
            Session session = SessionAccessor.GetSession();
            try
            {
                info = RackCapacityService.SearchEmptyRacks(session, parameter.EmptyRackCount, parameter.RackType, parameter.Layout);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }
            return info;
        }

        /// <summary>
        /// 選択した空きラックを含む連続空きラックグループ情報を取得する
        /// </summary>
        /// <param name="emptyRackCount">検索する連続空きラック数</param>
        /// <param name="rackType">ラック種別</param>
        /// <param name="selectedLayoutObject">画面で選択したレイアウトオブジェクト</param>
        /// <param name="layoutObjectGroup">選択したレイアウトオブジェクトを含む空きラックグループ</param>
        /// <returns></returns>
        [Route("rackGroup")]
        public RackCapacityInfo SetRackGroupInfo(GetEmptyRackObjectParameter parameter)
        {
            RackCapacityInfo info = new RackCapacityInfo();
            Session session = SessionAccessor.GetSession();
            try
            {
                info = RackCapacityService.GetEmptyRackObjects(session, parameter.EmptyRackCount, parameter.RackType, parameter.SelectedLayoutObject, parameter.LayoutObjectGroup);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                return null;
            }
            return info;
        }
        
    }
}
