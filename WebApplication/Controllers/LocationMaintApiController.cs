using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using garmit.DomainObject;
using garmit.Core;
using garmit.Web.Accessor;
using garmit.Service.Location;
using garmit.Web.Filter;
using garmit.Web.Models;

namespace garmit.Web.Controllers
{
    /// <summary>
    /// ロケーションサービスのAPIコントローラ
    /// </summary>
    [SessionExpireApiFilter]
    [RoutePrefix("api/location")]
    public class LocationMaintApiController : ApiController
    {
        /// <summary>
        /// ロケーションサービス
        /// </summary>
        public ILocationService LocationService { get; set; }

        public LocationMaintApiController()
        {
            LocationService = ServiceManager.GetService<ILocationService>("LocationService");
        }

        /// <summary>
        /// 初期表示情報取得
        /// </summary>
        /// <returns></returns>
        [Route("")]
        public LocationInfo GetLocations()
        {
            LocationInfo info = new LocationInfo();
            Session session = SessionAccessor.GetSession();
            try
            {
                info = LocationService.GetLookUp(session);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                info = null;
            }
            return info;
        }

        /// <summary>
        /// 並び替え可能かどうかを取得する
        /// </summary>
        /// <returns></returns>
        [Route("allow")]
        public IEnumerable<Location> CanChangeOrder(Location location)
        {
            LocationInfo info = new LocationInfo();
            Session session = SessionAccessor.GetSession();
            try
            {
                info = LocationService.GetSortLocationList(session, location);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                info.Locations = null;
            }
            return info.Locations;
        }

        /// <summary>
        /// 編集されたロケーション情報を保存する
        /// </summary>
        /// <returns></returns>
        [Route("update")]
        public LocationInfo PostUpdateLocation(LocationQueryParameter locationQueryParameter)
        {
            Session session = SessionAccessor.GetSession();
            LocationInfo info = new LocationInfo();
            try
            {
                info = LocationService.SetLocation(session, locationQueryParameter.Location, locationQueryParameter.SelectedLocationId, locationQueryParameter.LocationNodeAddPosition);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }
            return info;
        }

        /// <summary>
        /// 削除するロケーション情報を送信する
        /// </summary>
        /// <returns></returns>
        [Route("delete")]
        public LocationInfo PostDeleteLocation(Location deleteLocation)
        {
            Session session = SessionAccessor.GetSession();
            LocationInfo info = new LocationInfo();
            try
            {
                info = LocationService.DeleteLocation(session, deleteLocation);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }
            return info;
        }


        /// <summary>
        /// 並べ替えられたロケーション情報を送信する
        /// </summary>
        /// <returns></returns>
        [Route("sort")]
        public RequestResult PostLocations(List<Location> locations)
        {
            Session session = SessionAccessor.GetSession();
            LocationInfo result = new LocationInfo();
            try
            {
                result = LocationService.SetLocations(session, locations);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }
            return result.RequestResult;
        }

        /// <summary>
        /// 指定の所属に属したロケーション一覧を取得する。（並列な一覧で取得）
        /// </summary>
        /// <param name="enterpriseIds">所属IDリスト</param>
        /// <returns></returns>
        [Route("getLocationsByEntId")]
        public IEnumerable<Location> PostGetLocations(IEnumerable<int> enterpriseIds)
        {
            Session session = SessionAccessor.GetSession();
            LocationInfo info = new LocationInfo();
            try
            {
                info = LocationService.GetLocationsByEnterpriseIds(session, enterpriseIds);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }
            return info.Locations;
        }

        /// <summary>
        /// 電気錠ラックロケーション一覧取得（ICカードで使用）(GET)
        /// </summary>
        /// <returns></returns>
        [Route("getERackLocations")]
        public IEnumerable<Location> GetERackLocations()
        {
            Session session = SessionAccessor.GetSession();
            IEnumerable<Location> locations = new List<Location>();
            try
            {
                locations = LocationService.GetERackLocations(session);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }
            return locations;
        }

        /// <summary>
        /// 電気錠ラックロケーション一覧取得（所属） （ICカードで使用）
        /// </summary>
        /// <param name="param">所属ID</param>
        /// <returns></returns>
        [Route("getERackLocationsByEntId")]
        public IEnumerable<Location> PostGetERackLocationsByEntId(IdIntegerQueryParameter param)
        {
            Session session = SessionAccessor.GetSession();
            IEnumerable<Location> locations = new List<Location>();
            try
            {
                locations = LocationService.GetERackLocations(session, param.Id);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }
            return locations;
        }
    }
}
