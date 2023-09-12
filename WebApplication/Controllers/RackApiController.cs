using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using garmit.Web.Filter;
using garmit.DomainObject;
using garmit.Web.Accessor;
using garmit.Core;
using garmit.Service.Rack;
using System.Globalization;
using garmit.Web.Models;

namespace garmit.Web.Controllers
{
    [SessionExpireApiFilter] 
    [RoutePrefix("api/rack")]
    public class RackApiController : ApiController
    {
        /// <summary>
        /// ラックサービス
        /// </summary>
        public IRackService RackService { get; set; }

        /// <summary>
        /// コンストラクタ
        /// </summary>
        public RackApiController()
        {
            RackService = ServiceManager.GetService<IRackService>("RackService");
        }
        
        /// <summary>
        /// 初期データ取得
        /// </summary>
        /// <returns>LookUpの入ったデータ</returns>
        [Route("")]
        public RackInfo GetInitialInfo(int locationId = -99)
        {
            RackInfo info = new RackInfo();
            Session session = SessionAccessor.GetSession();

            try
            {
                info = RackService.GetLookUpAndRack(session, locationId);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                info = null;
            }

            return info;
        }

        /// <summary>
        /// ラックを取得する
        /// </summary>
        /// <param name="param">ロケーションID/レイアウトオブジェクトが必要かどうか</param>
        /// <returns>ラックデータ</returns>
        [Route("getRack")]
        public RackInfo PostGetRack(RackQueryParameter param)
        {
            RackInfo info = new RackInfo();
            Session session = SessionAccessor.GetSession();

            try
            {
                info = RackService.GetRack(session, param.LocationId, param.NeedLayoutObject);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                info = null;
            }
            
           return info;
        }

        /// <summary>
        /// ラックを検索して取得する
        /// </summary>
        /// <param name="lookUp">検索条件</param>
        /// <returns></returns>
        [Route("getRacks")]
        public RackInfo PostGetRacks(LookUp lookUp)
        {
            RackInfo info = new RackInfo();
            Session session = SessionAccessor.GetSession();

            try
            {
                info = RackService.GetRacks(session, lookUp);
            }
            catch(Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                info = null;
            }

            return info;
        }
        
        /// <summary>
        /// ラック（複数）を取得する
        /// </summary>
        /// <param name="rackIds">ラックIDリスト</param>
        /// <returns>ラック情報（複数）※Unit情報含む。詳細情報なし。</returns>
        [Route("getRacksByRackId")]
        public IEnumerable<Rack> PostGetRacksByRackId(IEnumerable<string> rackIds)
        {
            RackInfo info = new RackInfo();
            Session session = SessionAccessor.GetSession();

            try
            {
                info = RackService.GetRacks(session, rackIds, false, true, false);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                return null;
            }

            return info.Racks;
        }
        /// <summary>
        /// ラック（複数）を取得する
        /// </summary>
        /// <param name="param">ラックIDリスト/レイアウトオブジェクトが必要かどうか</param>
        /// <returns>ラック情報（複数）※Unit情報含む。詳細情報なし。</returns>
        [Route("getRackViews")]
        public IEnumerable<Rack> PostGetRackViews(RacksQueryParameter param)
        {
            RackInfo info = new RackInfo();
            Session session = SessionAccessor.GetSession();

            try
            {
                info = RackService.GetRackViews(session, param.RackIds, param.NeedLayoutObject);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                return null;
            }

            return info.Racks;
        }

        /// <summary>
        /// ラック電源の使用状況を取得する
        /// </summary>
        /// <param name="locationId">ロケーションID</param>
        /// <returns>ラック電源の使用状況</returns>
        [Route("getPowerValues")]
        public RackInfo GetRackPowerValues(int locationId)
        {
            RackInfo info = new RackInfo();
            Session session = SessionAccessor.GetSession();

            try
            {
                info = RackService.GetRackPowerValues(session, locationId);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                info = null;
            }

            return info;
        }

        /// <summary>
        /// ラックを保存する
        /// </summary>
        /// <param name="rack">保存するラック情報</param>
        /// <returns>成功/失敗、エラーメッセージ</returns>
        [Route("setRack")]
        public RequestResult SetRack(Rack rack)
        {
            RackInfo info = new RackInfo();
            Session session = SessionAccessor.GetSession();

            try
            {
                info = RackService.SetRack(session, rack);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                info.RequestResult = GetErrorRequestResult(session.CultureInfo, true);
            }
            
            return info.RequestResult;       
        }

        /// <summary>
        /// ラックを削除する
        /// </summary>
        /// <param name="rack">ラック情報</param>
        /// <returns>成功/失敗、エラーメッセージ</returns>
        [Route("deleteRack")]
        public RequestResult PostDeleteRack(Rack rack)
        {
            RackInfo info = new RackInfo();
            Session session = SessionAccessor.GetSession();

            try
            {
                info = RackService.DeleteRack(session, rack);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                info.RequestResult = GetErrorRequestResult(session.CultureInfo, false);
            }
            
            return info.RequestResult;
        }
        
        /// <summary>
        /// エラーリクエスト結果を取得する
        /// </summary>
        /// <param name="cultureInfo">カルチャ情報</param>
        /// <param name="isRegister">データ登録かどうか</param>
        /// <returns>リクエスト結果</returns>
        private RequestResult GetErrorRequestResult(CultureInfo cultureInfo, bool isRegister)
        {
            string messageId = isRegister ? "Rack_RegisterError" : "Rack_DeleteError";
            return new RequestResult
            {
                IsSuccess = false,
                Message = MessageUtil.GetMessage(messageId, cultureInfo)
            };                
        }
        
    }
}
