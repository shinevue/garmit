using garmit.Core;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;

namespace garmit.Web.Accessor
{
    /// <summary>
    /// ファイルのアクセッサ
    /// </summary>
    public class FileAccesor
    {
        /// <summary>
        /// ファイルを削除する
        /// </summary>
        /// <param name="filePath">ファイルまでのパス</param>
        /// <returns></returns>
        public static bool DeleteFile(string filePath)
        {
            try
            {
                FileInfo fileInfo = new FileInfo(filePath);

                if (fileInfo.Exists)
                {
                    //読取専用属性がある場合、読取専用属性を解除する
                    if ((fileInfo.Attributes & FileAttributes.ReadOnly) == FileAttributes.ReadOnly)
                    {
                        fileInfo.Attributes = FileAttributes.Normal;
                    }

                    fileInfo.Delete();
                }
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                return false;
            }

            return true;
        }

        /// <summary>
        /// 複数ファイルを一括削除する
        /// </summary>
        /// <param name="paths">ファイルまでのパスリスト</param>
        /// <returns></returns>
        public static bool DeleteFiles(IEnumerable<string> paths)
        {
            bool isSuccess = true;

            foreach (string path in paths)
            {
                if (!DeleteFile(path))
                {
                    isSuccess = false;
                }
            }

            return isSuccess;
        }

        /// <summary>
        /// ディレクトリを全て削除する
        /// </summary>
        /// <param name="directoryPath">ディレクトリのパス</param>
        /// <returns></returns>
        public static bool DeleteDirectory(string directoryPath)
        { 
            try
            {
                DirectoryInfo info = new DirectoryInfo(directoryPath);

                if (info.Exists)
                {
                    RemoveReadonlyAttribute(info);
                    
                    info.Delete(true);          //全てのファイルを削除
                }
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                return false;
            }

            return true;
        }

        /// <summary>
        /// 複数ディレクトリを全て削除する
        /// </summary>
        /// <param name="directoryPath">ディレクトリのパス</param>
        /// <returns></returns>
        public static bool DeleteDirectories(IEnumerable<string> directoryPaths)
        {
            bool isSuccess = true;
            
            foreach (string path in directoryPaths)
            {
                if (!DeleteDirectory(path))
                {
                    isSuccess = false;
                }
            }

            return isSuccess;
        }

        /// <summary>
        /// フォルダは以下のすべてのファイル、フォルダの属性を削除する
        /// </summary>
        /// <param name="info">削除するフォルダ情報</param>
        private static void RemoveReadonlyAttribute(DirectoryInfo info)
        {
            //読取専用属性がある場合、読取専用属性を解除する
            if ((info.Attributes & FileAttributes.ReadOnly) == FileAttributes.ReadOnly)
            {
                info.Attributes = FileAttributes.Normal;
            }

            foreach (FileInfo fileInfo in info.GetFiles())
            {
                if ((fileInfo.Attributes & FileAttributes.ReadOnly) == FileAttributes.ReadOnly)
                {
                    fileInfo.Attributes = FileAttributes.Normal;
                }
            }
            
            //サブフォルダの俗世鵜を回帰的に変更
            foreach (DirectoryInfo subDirectoryInfo in info.GetDirectories())
            {
                RemoveReadonlyAttribute(subDirectoryInfo);
            }
        }
    }
}