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
using garmit.Service.NetworkPath;
using garmit.Web.Filter;

namespace garmit.Web.Controllers
{
    /// <summary>
    /// ネットワーク経路のAPIコントローラ
    /// </summary>
    [SessionExpireApiFilter] 
    [RoutePrefix("api/networkPath")]
    public class NetworkPathApiController : ApiController
    {
        /// <summary>
        /// ラックサービス
        /// </summary>
        public INetworkPathService NetworkPathService { get; set; }

        /// <summary>
        /// コンストラクタ
        /// </summary>
        public NetworkPathApiController()
        {
            NetworkPathService = ServiceManager.GetService<INetworkPathService>("NetworkPathService");
        }

        /// <summary>
        /// 初期データ取得
        /// </summary>
        /// <returns>LookUpの入ったデータ</returns>
        [Route("")]
        public NetworkPathInfo GetInitialInfo()
        {
            NetworkPathInfo info = new NetworkPathInfo();
            Session session = SessionAccessor.GetSession();

            try
            {
                info = NetworkPathService.GetLookUp(session);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                info = null;
            }

            return info;
        }
        
        /// <summary>
        /// 指定のネットワークIDに一致したネットワーク経路を取得する
        /// </summary>
        /// <param name="networkId"></param>
        /// <returns></returns>
        [Route("getNetworkPath")]
        public NetworkPathInfo GetNetworkPath(int networkId)
        {
            NetworkPathInfo info = new NetworkPathInfo();
            Session session = SessionAccessor.GetSession();

            try
            {
                info = NetworkPathService.GetNetworkPathInfo(session, networkId);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                info = null;
            }

            return info;
        }

        /// <summary>
        /// 検索条件に一致したネットワーク経路一覧を取得する
        /// </summary>
        /// <param name="lookUp">検索条件</param>
        /// <returns>ネットワーク経路一覧</returns>
        [Route("getNetworkPathRows")]
        public IEnumerable<NetworkPathRow> PostGetNetworkPathRows(LookUp lookUp)
        {
            NetworkPathInfo info = new NetworkPathInfo();
            Session session = SessionAccessor.GetSession();

            try
            {
                info = NetworkPathService.GetNetworkPathRows(session, lookUp);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                info = null;
            }

            return info.NetworkPathRows;
        }

        /// <summary>
        /// ネットワーク情報を取得する（UnitDispSettingなし）
        /// </summary>
        /// <param name="param">ネットワークID</param>
        /// <returns></returns>
        [Route("getNetworkPathByNetworkId")]
        public IEnumerable<NetworkPath> PostGetNetwrokPathByNetwrokId(IdIntegerQueryParameter param)
        {
            NetworkPathInfo info = new NetworkPathInfo();
            Session session = SessionAccessor.GetSession();

            try
            {
                info = NetworkPathService.GetNetworkPath(session, param.Id, false, false);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                return null;
            }

            return info.NetworkPaths;
        }

        /// <summary>
        /// ネットワーク情報を取得する（UnitDispSettingあり）
        /// </summary>
        /// <param name="param">ネットワークID</param>
        /// <returns></returns>
        [Route("getNetworkPathWithUnit")]
        public NetworkPathInfo PostGetNetwrokPathWithUnit(IdIntegerQueryParameter param)
        {
            NetworkPathInfo info = new NetworkPathInfo();
            Session session = SessionAccessor.GetSession();

            try
            {
                info = NetworkPathService.GetNetworkPath(session, param.Id, true, true);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                return null;
            }

            return info;
        }

        /// <summary>
        /// ネットワーク経路を保存する
        /// </summary>
        /// <param name="networkPath">保存するネットワーク経路</param>
        /// <returns>成功/失敗</returns>
        [Route("setNetworkPath")]
        public bool SetNetworkPath(NetworkPath networkPath)
        {
            bool isSuccess = false;
            Session session = SessionAccessor.GetSession();

            try
            {
                isSuccess = NetworkPathService.SetNetworkPath(session, networkPath);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return isSuccess;
        }

        /// <summary>
        /// 指定のネットワーク経路を削除する
        /// </summary>
        /// <param name="networkPath">削除するネットワーク経路</param>
        /// <returns>成功/失敗</returns>
        [Route("deleteNetworkPath")]
        public bool PostDeleteNetworkPath(NetworkPath networkPath)
        {
            bool isSuccess = false;
            Session session = SessionAccessor.GetSession();

            try
            {
                isSuccess = NetworkPathService.DeleteNetworkPath(session, networkPath);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return isSuccess;
        }

        /// <summary>
        /// 指定のネットワーク経路一覧を削除する
        /// </summary>
        /// <param name="networkPaths">削除するネットワーク一覧</param>
        /// <returns>成功/失敗</returns>
        [Route("deleteNetworkPaths")]
        public bool PostDeleteNetworkPaths(IEnumerable<NetworkPathRow> networkPathRows)
        {
            bool isSuccess = false;
            Session session = SessionAccessor.GetSession();

            try
            {
                isSuccess = NetworkPathService.DeleteNetworkPaths(session, networkPathRows);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return isSuccess;
        }
        
    }
}
