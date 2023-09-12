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
using garmit.Service.FloorMap;
using garmit.Model.LoginUser;
using garmit.Web.Filter;
using System.IO;
using System.Web;
using System.Globalization;

namespace garmit.Web.Controllers
{
    /// <summary>
    /// フロアマップのAPIコントローラ
    /// </summary>
    [SessionExpireApiFilter]
    [RoutePrefix("api/floorMap")]
	public class FloorMapApiController : ApiController
	{
		/// <summary>
		/// フロアマップサービスサービス
		/// </summary>
		public IFloorMapService FloorMapService { get; set; }

		/// <summary>
		/// コンストラクタ
		/// </summary>
		public FloorMapApiController()
		{
			FloorMapService = ServiceManager.GetService<IFloorMapService>("FloorMapService");
		}

		#region common
		/// <summary>
		/// 初期表示情報取得
		/// </summary>
		/// <returns></returns>
		[Route("")]
		public FloorMapInfo GetInitialInfo()
		{
			FloorMapInfo info = new FloorMapInfo();
			Session session = SessionAccessor.GetSession();
			try
			{
                info = FloorMapService.GetLookUp(session);
            }
			catch (Exception ex)
			{
				Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                info= null;
			}
			return info;
		}

        /// <summary>
		/// レイアウトIDとフロアマップオプションからレイアウト情報を取得
		/// </summary>
		/// <param name="parameter"></param>
		/// <returns></returns>
		[Route("layout")]
        public FloorMapInfo SetFloorMapLayout(GetLayoutInfoQueryParameter parameter)
        {
            FloorMapInfo info = new FloorMapInfo();
            Session session = SessionAccessor.GetSession();
            try
            {
                if (parameter.FloorMapOption !=null )
                {
                    info = FloorMapService.GetLayout(session, parameter.LayoutInfo.LayoutId, parameter.IsConvert, parameter.FloorMapOption);        //フロアマップからの呼び出し
                }
                else if (parameter.RackCapacityOption != null)
                {
                    info = FloorMapService.GetLayout(session, parameter.LayoutInfo.LayoutId, parameter.IsConvert, parameter.RackCapacityOption);    //ラックキャパシティからの呼び出し（ラックステータス）
                }
                else
                {
                    info = FloorMapService.GetLayout(session, parameter.LayoutInfo.LayoutId);   //通常マップ
                }
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                info = null;
            }
            return info;
        }

        /// <summary>
        /// 温度分布図情報を取得
        /// </summary>
        /// <param name="parameter"></param>
        /// <returns></returns>
        [Route("tempmap")]
		public FloorMapInfo SetFloorMapLayer(GetTempMapQueryParameter parameter)
		{
			FloorMapInfo info = new FloorMapInfo();
			Session session = SessionAccessor.GetSession();
			try
			{
                info = FloorMapService.GetTempMap(session, parameter.LayoutInfo, parameter.NeedsKnownPointMark);
            }
            catch (Exception ex)
			{
				Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                info.RequestResult = GetErrorGetRequestResult(session.CultureInfo);
            }
			return info;
		}

        /// <summary>
        /// オブジェクトIDから選択オブジェクトのリンク先情報を取得
        /// </summary>
        /// <param name="parameter">取得条件</param>
        /// <returns></returns>
        [Route("objectLink")]
		public FloorMapInfo SetObjectLink(GetValueQueryParameter parameter)
		{
			FloorMapInfo info = new FloorMapInfo();
			Session session = SessionAccessor.GetSession();
			try
			{
                info = FloorMapService.GetLayoutObjectLink(session, parameter.SelectObject, parameter.IsConvert);
            }
			catch (Exception ex)
			{
				Logger.Instance.LogException(ex, Logger.LogLevel.Error);
			}
			return info;
		}

        /// <summary>
		/// 選択中ラックのラックビュー情報取得
		/// </summary>
		/// <param name="selectObject">選択中オブジェクト情報</param>
		/// <returns></returns>
		[Route("rackView")]
        public Rack SetRackView(LayoutObject selectObject)
        {
            Rack info = new Rack();
            Session session = SessionAccessor.GetSession();
            try
            {
                FloorMapInfo rackView = FloorMapService.GetRackView(session, selectObject);
                if (rackView.SelectedRack != null)
                {
                    info = rackView.SelectedRack;
                }
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }
            return info;
        }
        #endregion

        #region グラフィックメンテナンス
        /// <summary>
        /// 初期表示情報取得
        /// </summary>
        /// <returns></returns>
        [Route("graphic")]
        public FloorMapInfo GetGraphicInitialInfo()
        {
            FloorMapInfo info = new FloorMapInfo();
            Session session = SessionAccessor.GetSession();
            try
            {
                //レイアウト一覧、
                info = FloorMapService.GetMaintenanceLookUp(session);

            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                info = null;
            }
            return info;
        }

        /// <summary>
        /// レイアウト削除
        /// </summary>
        /// <returns></returns>
        [HttpPost]
        [Route("graphic/delete")]
        public FloorMapInfo SetDeleteLayout(Layout delete)
        {
            FloorMapInfo result = new FloorMapInfo();
            Session session = SessionAccessor.GetSession();
            try
            {
                //レイアウト削除
                result = FloorMapService.DeleteFloorMap(session, delete);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                result.RequestResult = new RequestResult { IsSuccess = false };
            }
            return result;
        }

        /// <summary>
        /// レイアウト保存
        /// </summary>
        /// <returns></returns>
        [HttpPost]
        [Route("graphic/save")]
        public FloorMapInfo SetSaveLayout(Layout save)
        {
            FloorMapInfo result = new FloorMapInfo ();
            Session session = SessionAccessor.GetSession();
            try
            {
                //レイアウト保存
                result = FloorMapService.SetFloorMap(session, save);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                result.RequestResult = new RequestResult{ IsSuccess = false};
            }
            return result;
        }

        /// <summary>
        /// 画像ファイルリストを取得する
        /// </summary>
        /// <returns></returns>
        [Route("graphic/getImageList")]
        public List<ImageInfoModel> GetSoundFileList()
        {
            List<ImageInfoModel> imageList = new List<ImageInfoModel>();
            try
            {
                Session session = SessionAccessor.GetSession();
                string uploadFolder = AppSettingAccessor.GetFloorMapImageDirectory() + '/' + session.SystemId;
                string[] files = Directory.GetFiles(Path.Combine(HttpRuntime.AppDomainAppPath, '.' + uploadFolder));
                foreach (string file in files)
                {
                    string fileName = Path.GetFileName(file);
                    imageList.Add(new ImageInfoModel { FileName = fileName, Url = uploadFolder + '/' + fileName });
                }
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return imageList;
        }
        #endregion
        
        #region リクエストエラー

        /// <summary>
        /// データ取得のエラーリクエスト結果を取得する
        /// </summary>
        /// <param name="cultureInfo">カルチャ情報</param>
        /// <returns>リクエスト結果</returns>
        private RequestResult GetErrorGetRequestResult(CultureInfo cultureInfo)
        {
            return new RequestResult
            {
                IsSuccess = false,
                Message = MessageUtil.GetMessage("TempMapGenerateError", cultureInfo)
            };
        }

        #endregion
        
    }
}
