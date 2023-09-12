using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using garmit.DomainObject;
using garmit.Service.Point;
using garmit.Core;
using garmit.Web.Models;
using garmit.Web.Accessor;
using garmit.Web.Filter;

namespace garmit.Web.Controllers
{
    /// <summary>
    /// ポイント一覧画面のAPIコントローラ
    /// </summary>
    [SessionExpireApiFilter]
    [RoutePrefix("api/Point")]
    public class PointApiController : ApiController
    {
        /// <summary>
        /// ポイントサービス
        /// </summary>
        public IPointService PointService { get; set; }

        public PointApiController()
        {
            PointService = ServiceManager.GetService<IPointService>("PointService");
        }

        /// <summary>
        /// マスターデータを取得する
        /// </summary>
        /// <returns></returns>
        [Route("")]
        public LookUp GetLookUp()
        {
            Session session = SessionAccessor.GetSession();
            PointInfo info = new PointInfo();

            try
            {
                info = PointService.GetLookUp(session);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return info.LookUp;
        }

        /// <summary>
        /// ポイント情報を返却する（検索結果）
        /// </summary>
        /// <param name="lookUp"></param>
        /// <returns></returns>
        [Route("getPointResult")]
        public PointInfo PostPointResult(LookUp lookUp)
        {
            Session session = SessionAccessor.GetSession();
            PointInfo info = new PointInfo();

            try
            {
                info = PointService.GetPoints(session, lookUp);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return info;
        }

        /// <summary>
        /// ポイント情報を返却する
        /// </summary>
        /// <param name="pointNos"></param>
        /// <returns></returns>
        [Route("getPoints")]
        public PointInfo PostPointInfo(IEnumerable<int> pointNos)
        {
            Session session = SessionAccessor.GetSession();
            PointInfo info = new PointInfo();

            try
            {
                info = PointService.GetPoints(session, pointNos);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return info;
        }

        /// <summary>
        /// 検索条件でポイントのリストを取得する
        /// </summary>
        /// <param name="lookUp"></param>
        /// <returns></returns>
        [Route("getPointsByLookUp")]
        public IEnumerable<Point> PostGetPointsByLookUp(LookUp lookUp)
        {
            Session session = SessionAccessor.GetSession();
            PointInfo info = new PointInfo();

            try
            {
                info = PointService.GetPointList(session, lookUp);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return info.Points;
        }

        /// <summary>
        /// SOCポイントを取得する
        /// </summary>
        /// <param name="locationId"></param>
        /// <returns></returns>
        [Route("getSocPoints")]
        public IEnumerable<Point> GetGetSocPoints(int locationId)
        {
            Session session = SessionAccessor.GetSession();
            PointInfo info = new PointInfo();

            try
            {
                info = PointService.GetPointList(session, locationId, 5);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return info.Points;
        }

        /// <summary>
        /// ロケーションIDからポイントを取得する
        /// </summary>
        /// <param name="locationId"></param>
        /// <returns></returns>
        [Route("getPointByLocation")]
        public IEnumerable<Point> GetPointByLocation(int locationId)
        {
            Session session = SessionAccessor.GetSession();
            PointInfo info = new PointInfo();

            try
            {
                info = PointService.GetPointList(session, locationId);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return info.Points;
        }

        /// <summary>
        /// 閾値と不感時間を変更する
        /// </summary>
        /// <param name="point"></param>
        /// <returns></returns>
        [Route("thresholdBlindTime")]
        public RequestResult SetThresholdAndBlindTime(Point point)
        {
            Session session = SessionAccessor.GetSession();
            PointInfo info = new PointInfo();

            try
            {
                info = PointService.SetThresholdAndBlindTime(session, point);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                return new RequestResult { IsSuccess = false };
            }
            // 更新処理
            return info.RequestResult;
        }

        /// <summary>
        /// ポイントを登録する
        /// </summary>
        /// <param name="point"></param>
        /// <returns></returns>
        [Route("setPoint")]
        public RequestResult PostSetPoint(Point point)
        {
            Session session = SessionAccessor.GetSession();
            PointInfo info = new PointInfo();

            try
            {
                info = PointService.SetPoint(session, point);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return info.RequestResult;
        }

        /// <summary>
        /// 複数ポイントを登録する
        /// </summary>
        /// <param name="points"></param>
        /// <returns></returns>
        [Route("setPoints")]
        public RequestResult PostSetPoints(IEnumerable<Point> points)
        {
            Session session = SessionAccessor.GetSession();
            PointInfo info = new PointInfo();

            try
            {
                info = PointService.SetPoints(session, points);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return info.RequestResult;
        }

        /// <summary>
        /// ポイントを削除する
        /// </summary>
        /// <param name="pointNo"></param>
        /// <returns></returns>
        [Route("deletePoint")]
        public RequestResult GetDeletePoint(int pointNo)
        {
            Session session = SessionAccessor.GetSession();
            PointInfo info = new PointInfo();

            try
            {
                info = PointService.DeletePoint(session, pointNo);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return info.RequestResult;
        }

        /// <summary>
        /// 複数ポイントを削除する
        /// </summary>
        /// <param name="pointNos"></param>
        /// <returns></returns>
        [Route("deletePoints")]
        public RequestResult PostDeletePoints(IEnumerable<int> pointNos)
        {
            Session session = SessionAccessor.GetSession();
            PointInfo info = new PointInfo();

            try
            {
                info = PointService.DeletePoints(session, pointNos);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return info.RequestResult;
        }

        /// <summary>
        /// 空のポイントを取得する
        /// </summary>
        /// <returns></returns>
        [Route("newPoint")]
        public Point GetNewPoint()
        {
            return new Point { PointNo = -1 };
        }
        
    }
}
