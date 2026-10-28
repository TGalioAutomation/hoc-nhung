/**
 * 1-Click Fork & Remix Engine for Community Projects
 *
 * Atomically loads a community circuit diagram, multi-board configuration,
 * and source code into the Velxio simulator while protecting existing work
 * from auto-save overwrites.
 */

import { buildLoadPayload, type RawProject } from '../pages/ProjectByIdPage';
import { useSimulatorStore } from '../store/useSimulatorStore';
import { useProjectStore } from '../store/useProjectStore';
import { useElectricalStore } from '../store/useElectricalStore';
import { showMessageDialog } from '../store/useMessageDialogStore';
import { getProjectById } from '../services/projectService';
import type { CommunityProject } from '../types/community';

export async function forkAndRemixProject(
  project: CommunityProject,
  onNavigate?: (path: string) => void
): Promise<void> {
  try {
    // 1. CRITICAL AUTO-SAVE SAFETY GUARD:
    // Clear currentProject FIRST before mutating any simulator or editor store.
    // If currentProject holds an ID, the auto-save debouncer would fire a PUT
    // to that project with the remixed circuits, overwriting the user's saved work.
    useProjectStore.getState().clearCurrentProject();

    // 2. Unpause electrical simulation so the newly remixed circuit is live
    useElectricalStore.getState().setPaused(false);

    // 3. Extract or fetch project raw data
    let rawData: RawProject | null = null;
    if (project.projectData) {
      rawData = {
        board_type: project.projectData.board_type,
        files: project.projectData.files ?? [],
        file_groups: project.projectData.file_groups,
        boards_json: project.projectData.boards_json,
        libraries_json: project.projectData.libraries_json,
        code: project.projectData.code ?? '',
        components_json: project.projectData.components_json,
        wires_json: project.projectData.wires_json,
      };
    } else if (project.id) {
      const fetched = await getProjectById(project.id);
      rawData = {
        board_type: fetched.board_type,
        files: fetched.files ?? [],
        file_groups: fetched.file_groups,
        boards_json: fetched.boards_json,
        libraries_json: fetched.libraries_json,
        code: fetched.code ?? '',
        components_json: fetched.components_json,
        wires_json: fetched.wires_json,
      };
    }

    if (!rawData) {
      throw new Error('Không tìm thấy dữ liệu sơ đồ mạch của dự án này.');
    }

    // 4. Build payload and load atomically into simulator
    const payload = buildLoadPayload(rawData);
    useSimulatorStore.getState().loadProjectState(payload);

    // 5. Notify user of successful remix
    showMessageDialog(
      `Đã nạp sơ đồ mạch & mã nguồn dự án "${project.name}" vào bàn thí nghiệm. Bạn có thể tự do chỉnh sửa, đổi linh kiện, lập trình và chạy thử nghiệm 100% miễn phí!`,
      {
        title: '🚀 Mở & Remix Mạch Này',
        kind: 'info',
      }
    );

    // 6. Navigate to editor if callback provided and not already on /editor
    if (onNavigate) {
      if (typeof window !== 'undefined') {
        const path = window.location.pathname;
        if (!path.endsWith('/editor') && !path.endsWith('/editor/')) {
          onNavigate('/editor');
        }
      } else {
        onNavigate('/editor');
      }
    }
  } catch (error) {
    console.error('[communityFork] Lỗi khi mở & remix dự án:', error);
    showMessageDialog(
      'Có lỗi xảy ra khi nạp dữ liệu mạch này vào bàn thí nghiệm. Vui lòng kiểm tra lại kết nối hoặc thử dự án khác.',
      {
        title: 'Không thể nạp mạch',
        kind: 'error',
      }
    );
  }
}
