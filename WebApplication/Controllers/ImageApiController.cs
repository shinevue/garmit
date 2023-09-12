using garmit.Core;
using garmit.DomainObject;
using garmit.Web.Accessor;
using garmit.Service.UnitImage;
using garmit.Web.Binding;
using garmit.Web.Filter;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web;
using System.Web.Http;
using System.Drawing;
using System.IO;

namespace garmit.Web.Controllers
{
    [SessionExpireApiFilter]
    [RoutePrefix("api/image")]
    public class ImageApiController : ApiController
    {
        /// <summary>
        /// ユニット画像サービス 
        /// </summary>
        public IUnitImageService UnitImageService { get; set; }

        public ImageApiController()
        {
            UnitImageService = ServiceManager.GetService<IUnitImageService>("UnitImageService");
        }


        /// <summary>
        /// 全ユニット画像を取得する
        /// </summary>
        /// <returns>成功/失敗</returns>
        [Route("getUnitImages")]
        public UnitImageInfo GetUnitImages()
        {
            UnitImageInfo info = new UnitImageInfo();
            Session session = SessionAccessor.GetSession();

            try
            {
                info = UnitImageService.GetUnitImageInfo(session);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return info;
        }

        /// <summary>
        /// ユニット画像を登録する
        /// </summary>
        /// <param name="unitImage"></param>
        /// <returns></returns>
        [Route("setUnitImage")]
        public bool PostSetUnitImage(UnitImage unitImage)
        {
            bool ret = false;
            Session session = SessionAccessor.GetSession();

            try
            {
                // 更新の場合
                if(unitImage.ImageId >= 0)
                {
                    UnitImageInfo info = UnitImageService.GetUnitImageInfo(session, unitImage.ImageId);
                    UnitImage beforeUnitImage = info.UnitImages.First();

                    // 画像が変更される場合
                    if (beforeUnitImage.FileName != unitImage.FileName)
                    {
                        // 変更前の画像ファイルを削除する
                        GetDeleteImageFile(beforeUnitImage.Url);
                    }
                }

                ret = UnitImageService.SetUnitImage(session, unitImage);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return ret;
        }

        /// <summary>
        /// ユニット画像を削除する
        /// </summary>
        /// <param name="unitImage"></param>
        /// <returns></returns>
        [Route("DeleteUnitImage")]
        public RequestResult PostDeleteUnitImage(UnitImage unitImage)
        {
            UnitImageInfo info = new UnitImageInfo();
            Session session = SessionAccessor.GetSession();

            try
            {
                info = UnitImageService.DeleteUnitImage(session, unitImage);

                if (info.RequestResult.IsSuccess == true)
                {
                    GetDeleteImageFile(unitImage.Url);
                }
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return info.RequestResult;
        }

        /// <summary>
        /// ユニット画像を一括削除する
        /// </summary>
        /// <param name="unitImages"></param>
        /// <returns></returns>
        [Route("DeleteUnitImages")]
        public RequestResult PostDeleteUnitImages(IEnumerable<UnitImage> unitImages)
        {
            UnitImageInfo info = new UnitImageInfo();
            Session session = SessionAccessor.GetSession();

            try
            {
                info = UnitImageService.DeleteUnitImages(session, unitImages);

                if (info.RequestResult.IsSuccess == true)
                {
                    foreach (UnitImage unitImage in unitImages)
                    {
                        GetDeleteImageFile(unitImage.Url);
                    }
                }
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return info.RequestResult;
        }

        /// <summary>
        /// 空のユニット画像を返す
        /// </summary>
        /// <returns></returns>
        [Route("NewUnitImage")]
        public UnitImage GetNewUnitImage()
        {
            return new UnitImage { ImageId = -1 };
        }

        #region 画像ファイル関係
        /// <summary>
        /// 画像ファイルを保存する
        /// </summary>
        /// <param name="imageMedia"></param>
        /// <returns></returns>
        [Route("setImageFile")]
        public RequestResult PostSetImageFile([FromBody]Media imageMedia)
        {
            Session session = SessionAccessor.GetSession();
            RequestResult errorResult = new RequestResult { IsSuccess = false, Message = "画像情報の登録に失敗しました。" };

            if (imageMedia == null)
            {
                return errorResult;
            }

            try
            {
                //画像フォルダを取得
                string uploadFolder = AppSettingAccessor.GetImageDirectory();

                //ファイル名を取得
                string filePath = imageMedia.FileName.Replace("\"", "");
                string fileName = Path.GetFileName(filePath);

                DirectoryInfo dir = new DirectoryInfo(Path.Combine(HttpRuntime.AppDomainAppPath, '.' + uploadFolder + '/' + session.SystemId));

                if (!dir.Exists)
                {
                    Directory.CreateDirectory(dir.FullName);
                }

                //画像のパスを生成
                FileInfo fi = new FileInfo(Path.Combine(dir.FullName, fileName));

                if (fi.Exists)
                {
                    return new RequestResult { IsSuccess = false, Message = "同じ名前のファイルが存在するため、保存できません。" }; ;
                }

                string fullPath = fi.FullName;
                Logger.Instance.LogMessage(fullPath, Logger.LogLevel.Debug);

                File.WriteAllBytes(fi.FullName, imageMedia.Buffer);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex);
                return errorResult;
            }

            return new RequestResult { IsSuccess = true };
        }

        /// <summary>
        /// 画像ファイルを削除する
        /// </summary>
        /// <param name="fileName">画像ファイル名</param>
        [Route("deleteImageFile")]
        public bool GetDeleteImageFile(string imageUrl)
        {
            bool result = false;

            try
            {
                // 画像のパスを生成
                FileInfo fi = new FileInfo(Path.Combine(HttpRuntime.AppDomainAppPath, '.' + imageUrl));

                // ファイルが存在しているか判断する
                if (fi.Exists)
                {
                    // 読み取り専用属性がある場合は、読み取り専用属性を解除する
                    if ((fi.Attributes & FileAttributes.ReadOnly) == FileAttributes.ReadOnly)
                    {
                        fi.Attributes = FileAttributes.Normal;
                    }
                    // ファイルを削除する
                    fi.Delete();
                }

                result = true;
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return result;
        }
        #endregion
        
    }
}
